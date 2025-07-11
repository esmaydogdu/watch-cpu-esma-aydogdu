export type StateType = "normal" | "high_load" | "recovered";

export type AlertType = "load" | "recovery"

export type DataPoint = {
  timestamp: string;
  loadAverage: number;
};

export type Alert = {
  type: AlertType;
  message: string;
  timestamp: number | string;
  duration?: number;
};

export const CONFIG = {
  CHART_DATA_POINTS: 600, // 10 mins
  ALERT_DATA_POINTS: 120, // 2 mins
  POLL_INTERVAL: 1000,
  HIGH_LOAD_THRESHOLD: .3,
} as const;


export type Episode = {
  state: 'high_load' | 'normal';
  startTime: string;
  duration?: number; // calculated in real-time
}
