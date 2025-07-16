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

/*
  CHART_DATA_POINTS * POLL_INTERVAL = 10 min window
  ALERT_DATA_POINTS * POLL_INTERVAL = 2 min alert check
*/
export const CONFIG = {
  CHART_DATA_POINTS: 300,
  ALERT_DATA_POINTS: 60, 
  POLL_INTERVAL: 2000,
  HIGH_LOAD_THRESHOLD: 1, // over 100%
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

