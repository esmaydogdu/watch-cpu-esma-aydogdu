export type DataPoint = {
  timestamp: string;
  loadAverage: number;
}


export type CpuLoadApiResponse = {
  loadAverage: number;
  timestamp: string;
  cpuCount: number;
}