/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { calculatePPSCCBaselines } from '../utils/calculate-pp-scc-baselines.util';
import Decimal from 'decimal.js';
import * as vesselsData from '../utils/vessels.json';
import * as ppReferenceData from '../utils/pp-reference.json';
import * as dailyLogEmissionsData from '../utils/daily-log-emissions.json';
import { VesselDeviation } from 'src/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EmissionsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  private readonly prisma: PrismaClient;
  private readonly logger = new Logger(EmissionsService.name);

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  private getQuarterEndDates(year: number): Date[] {
    return Array.from({ length: 4 }, (_, i) => {
      const month = (i + 1) * 3;
      const date = new Date(year, month, 0); // Last day of the month
      return date;
    });
  }

  async getQuarterlyDeviations(year: number): Promise<VesselDeviation[]> {
    const cacheKey = `deviations_${year}`;
    const cached = await this.cacheManager.get<VesselDeviation[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const vessels = await this.prisma.vessel.findMany();
    const results: VesselDeviation[] = [];
    const quarterEndDates = this.getQuarterEndDates(year);

    for (const vessel of vessels) {
      const ppReference = await this.prisma.pPReference.findFirst({
        where: {
          vesselTypeId: vessel.vesselType,
          category: 'PP',
          traj: 'MIN',
        },
      });

      if (!ppReference) {
        this.logger.warn(`No PP reference found for vessel ${vessel.name}`);
        continue;
      }

      const ppReferenceLine = {
        Traj: ppReference.traj, // Note the capital T in Traj
        a: ppReference.a,
        b: ppReference.b,
        c: ppReference.c,
        d: ppReference.d,
        e: ppReference.e,
      };

      const quarterlyEmissions = await this.prisma.emission.findMany({
        where: {
          vesselId: vessel.id,
          toUtc: {
            in: quarterEndDates,
          },
        },
        orderBy: { toUtc: 'asc' },
      });

      const baselines = calculatePPSCCBaselines({
        factors: [ppReferenceLine],
        year,
        DWT: new Decimal(50000), // let it be a typical DWT for a vessel
      });

      results.push({
        vesselName: vessel.name,
        deviations: quarterlyEmissions.map((emission) => ({
          date: emission.toUtc,
          actual: emission.eeoico2eW2w,
          baseline: baselines.min.toNumber(),
          deviation: this.calculateDeviation(
            emission.eeoico2eW2w,
            baselines.min.toNumber(),
          ),
        })),
      });
    }

    await this.cacheManager.set(cacheKey, results);
    return results;
  }

  async getQuarterlyDeviationsDummy(year: number): Promise<VesselDeviation[]> {
    try {
      const vessels = vesselsData.map((vessel) => vessel.Name);
      const quarterEndDates = this.getQuarterEndDates(year);

      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, Number((Math.random() * 500).toFixed(2))),
      );

      const deviations = vessels.map((vesselName) => ({
        vesselName,
        deviations: quarterEndDates.map((date) => ({
          date,
          actual: Number((Math.random() * 10 + 5).toFixed(2)), // Random value between 5-15
          baseline: 10,
          deviation: Number((Math.random() * 40 - 20).toFixed(2)), // Random deviation between -20 and +20
        })),
      }));

      return deviations;
    } catch (error) {
      this.logger.error('Error generating dummy data:', error);
      throw new Error('Failed to generate dummy deviations data');
    }
  }

  private calculateDeviation(actual: number, baseline: number): number {
    return ((actual - baseline) / baseline) * 100;
  }

  private async importVessels() {
    this.logger.log('Importing vessels...');
    const vessels = vesselsData;

    await this.prisma.vessel.createMany({
      data: vessels.map((vessel) => ({
        imoNo: vessel.IMONo,
        name: vessel.Name,
        vesselType: vessel.VesselType,
      })),
      skipDuplicates: true,
    });
  }

  private async importPPReference() {
    this.logger.log('Importing PP reference data...');

    await this.prisma.pPReference.createMany({
      data: ppReferenceData.map((ref) => ({
        category: ref.Category,
        vesselTypeId: ref.VesselTypeID,
        size: ref.Size,
        traj: ref.Traj.trim(),
        a: ref.a,
        b: ref.b,
        c: ref.c,
        d: ref.d,
        e: ref.e,
      })),
      skipDuplicates: true,
    });
  }

  private async importEmissions() {
    this.logger.log('Importing emissions data...');

    // First, get all vessels in a single query
    const vessels = await this.prisma.vessel.findMany({
      select: {
        id: true,
        imoNo: true,
      },
    });

    // Create a map for quick vessel lookup
    const vesselMap = new Map(
      vessels.map((vessel) => [vessel.imoNo, vessel.id]),
    );

    // Filter and transform emissions data
    const emissionsToCreate = dailyLogEmissionsData
      .filter((emission) => vesselMap.has(emission.VesselID))
      .map((emission) => ({
        id: emission.EID,
        vesselId: vesselMap.get(emission.VesselID)!,
        logId: emission.LOGID,
        fromUtc: new Date(emission.FromUTC),
        toUtc: new Date(emission.TOUTC),
        totT2wco2: emission.TotT2WCO2,
        totW2wco2: emission.ToTW2WCO2,
        aerco2T2w: emission.AERCO2T2W,
        aerco2eW2w: emission.AERCO2eW2W,
        eeoico2eW2w: emission.EEOICO2eW2W,
      }));

    if (emissionsToCreate.length > 0) {
      await this.prisma.emission.createMany({
        data: emissionsToCreate,
        skipDuplicates: true,
      });
    }

    // Log skipped records
    const skippedCount =
      dailyLogEmissionsData.length - emissionsToCreate.length;
    if (skippedCount > 0) {
      this.logger.warn(
        `Skipped ${skippedCount} emissions records due to missing vessels`,
      );
    }
  }

  async importData() {
    try {
      this.logger.log('Starting bulk import...');

      await this.prisma.$transaction(async () => {
        await this.importVessels();
        await this.importPPReference();
        await this.importEmissions();
      });

      this.logger.log('Bulk import completed successfully');
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      this.logger.error('Bulk import failed:', error);
      throw error;
    }
  }
}
