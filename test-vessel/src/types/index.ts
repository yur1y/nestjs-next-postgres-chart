export interface Deviation {
  date: Date;
  actual: number;
  baseline: number;
  deviation: number;
}

export interface VesselDeviation {
  vesselName: string;
  deviations: Deviation[];
}
