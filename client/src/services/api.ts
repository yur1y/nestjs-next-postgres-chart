import axios from "axios";
import { VesselDeviation } from "../types/emissions";

export type DataSource = "real" | "dummy";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

export const getEmissionsData = async (
  year: number,
  dataSource: DataSource = "real"
): Promise<VesselDeviation[]> => {
  const endpoint = dataSource === "real" ? "deviations" : "deviations-dummy";
  const { data } = await api.get<VesselDeviation[]>(
    `/emissions/${endpoint}?year=${year}`
  );
  return data;
};
