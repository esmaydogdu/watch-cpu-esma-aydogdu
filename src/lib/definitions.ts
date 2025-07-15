export type StateType = "normal" | "high_load" | "recovered";

export type AlertType = "load" | "recovery";

export type DataPoint = {
  timestamp: string;
  loadAverage: number;
};

export type Alert = {
  type: AlertType;
  message: string;
  timestamp: string;
  duration?: number;
};

export const CONFIG = {
  CHART_DATA_POINTS: 600,
  ALERT_DATA_POINTS: 10, 
  POLL_INTERVAL: 1000,
  HIGH_LOAD_THRESHOLD: .3,
} as const;

export const EpisodeText = {
  'high_load': 'Under heavy load since: ',
  'normal': 'Last recovered at: '
} as const

export type Episode = {
  state: keyof typeof EpisodeText;
  startTime: string;
  duration?: number;
};

