/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// import { CE_PPSCCReferenceLine } from '@prisma/client'; //not working
import Decimal from 'decimal.js';

// Define the base interface for PP reference line
interface PPSCCReferenceLine {
  RowID: number;
  Category: string;
  VesselTypeID: number;
  Size: string;
  Traj: string;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
}

// Use the original Omit type with our local interface
type PPSSCPreferenceLine = Omit<
  PPSCCReferenceLine,
  'RowID' | 'Category' | 'VesselTypeID' | 'Size'
>;
type CalculatePPBaselinesArgs = {
  factors: PPSSCPreferenceLine[];
  year: number;
  DWT: Decimal;
};

type PPBaselines = {
  min: Decimal;
  striving: Decimal;
  yxLow: Decimal;
  yxUp: Decimal;
};

const yxLowF = 0.33;
const yxUpF = 1.67;

const emptyFactor = {
  Traj: '',
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
};

export const calculatePPSCCBaselines = ({
  factors,
  year,
  DWT,
}: CalculatePPBaselinesArgs): PPBaselines => {
  const { minFactors, strFactors } = factors.reduce<{
    minFactors: PPSSCPreferenceLine;
    strFactors: PPSSCPreferenceLine;
  }>(
    (acc, cur) => {
      const key = (() => {
        // Keep trim since Traj contain spaces
        switch (cur.Traj?.trim()) {
          case 'MIN':
            return 'minFactors';
          case 'STR':
            return 'strFactors';
          default:
            return null;
        }
      })();

      if (!key) {
        return acc;
      }

      return {
        ...acc,
        [key]: cur,
      };
    },
    { minFactors: emptyFactor, strFactors: emptyFactor },
  );

  const min = calculatePPSCCBaseline({ factors: minFactors, year, DWT });

  const striving = calculatePPSCCBaseline({ factors: strFactors, year, DWT });

  const yxLow = Decimal.mul(min, yxLowF);

  const yxUp = Decimal.mul(min, yxUpF);

  return {
    min,
    striving,
    yxLow,
    yxUp,
  };
};

type CalculateBaselineArgs = {
  factors: PPSSCPreferenceLine;
  year: number;
  DWT: Decimal;
};

const calculatePPSCCBaseline = ({
  factors,
  year,
  DWT,
}: CalculateBaselineArgs) =>
  Decimal.mul(
    Decimal.sum(
      Decimal.mul(factors.a ?? 0, Decimal.pow(year, 3)),
      Decimal.mul(factors.b ?? 0, Decimal.pow(year, 2)),
      Decimal.mul(factors.c ?? 0, year),
      factors.d ?? 0,
    ),
    Decimal.pow(DWT, factors.e ?? 0),
  );
