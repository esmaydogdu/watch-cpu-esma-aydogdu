import { DataPoint, Alert, Episode, CONFIG } from "./definitions";

export const checkTransition = (
  prevList: DataPoint[],
  currentData: DataPoint,
  currentEpisode: Episode | null
): null | { episode: Episode; alert: Alert } => {

  // not enough data to check
  if (prevList.length < CONFIG.ALERT_DATA_POINTS - 1) {
    return null;
  }

  const currentBatch = [...prevList, currentData].slice(
    -CONFIG.ALERT_DATA_POINTS
  );

  const lastBatch = prevList.slice(-(CONFIG.ALERT_DATA_POINTS - 1));

  const isInRecovery =
    lastBatch.every((data) => data.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD) &&
    currentData.loadAverage < CONFIG.HIGH_LOAD_THRESHOLD;

  const isHighLoad = currentBatch.every(
    (data) => data.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD
  );

  if (isHighLoad) {

    const newEpisode: Episode = {
      state: "high_load",
      startTime: currentBatch[0].timestamp,
    };
    const duration = CONFIG.ALERT_DATA_POINTS * CONFIG.POLL_INTERVAL;

    if (currentEpisode?.state !== "high_load") {

      return {
        episode: newEpisode,
        alert: {
          type: "load",
          message: `CPU is under heavy load for ${Math.floor(
            duration / 60000
          )}m`,
          timestamp: currentBatch[0].timestamp,
        },
      };
    }
  }

  if (isInRecovery) {

    const duration = currentEpisode?.startTime
      ? Date.parse(currentData.timestamp) - Date.parse(currentEpisode.startTime)
      : 0;

    return {
      episode: {
        state: "normal",
        startTime: currentData.timestamp,
      },
      alert: {
        type: "recovery",
        message: `CPU has recovered from heavy load (lasted ${Math.floor(
          duration / 60000
        )}m)`,
        timestamp: currentData.timestamp,
      },
    };
  }

  return null;
};

export const formatPercentage = (value: number) => {
  return (value * 100).toFixed(2) + '%'
}