"use client";

import { useQuery } from "@tanstack/react-query";
import { CONFIG, DataPoint, Alert, Episode } from "@/lib/definitions";
import { useState, useEffect } from "react";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import styles from "./page.module.css";

// Helper functions
const loadFromLocalStorage = (key: string): DataPoint[] => {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

const saveToLocalStorage = (key: string, data: DataPoint[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// takes the list without appending the new data point, passes it separetely
// or not, then we cont need the current data
const checkTransition = (
  prevList: DataPoint[],
  currentData: DataPoint,
  currentEpisode: Episode | null
): null | { episode: Episode; alert: Alert } => {

  if (prevList.length < CONFIG.ALERT_DATA_POINTS - 1) {
    return null;
  }


  const lastBatchIncludingCurrent = [...prevList, currentData].slice(
    -CONFIG.ALERT_DATA_POINTS
  );
  const lastBatchExcludingCurrent = prevList.slice(-(CONFIG.ALERT_DATA_POINTS - 1));

  const isInRecovery =
    lastBatchExcludingCurrent.every(
      (data) => data.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD
    ) && currentData.loadAverage < CONFIG.HIGH_LOAD_THRESHOLD;

  const isHighLoad = lastBatchIncludingCurrent.every(
    (data) => data.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD
  );

  if (isHighLoad) {
    console.log('in high load')
    const newEpisode : Episode = {
      state: "high_load",
      startTime: lastBatchIncludingCurrent[0].timestamp,
    };
    const duration = CONFIG.ALERT_DATA_POINTS * CONFIG.POLL_INTERVAL;

    if (currentEpisode?.state !== "high_load") {
      console.log('in high load, alert sent')
      return {
        episode: newEpisode,
        alert: {
          type: "load",
          message: `CPU is under heavy load for ${Math.floor(
            duration / 60000 
          )} seconds`,
          timestamp: lastBatchIncludingCurrent[0].timestamp,
        },
      };
    }
  }

  if (isInRecovery) {
    console.log('in recovery')
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

const processNewDataPoint = (
  prevList: DataPoint[],
  currentData: DataPoint,
  currentEpisode: Episode | null,
  setCurrentEpisode: React.Dispatch<React.SetStateAction<Episode | null>>,
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>,
  setTimeSeriesData: React.Dispatch<React.SetStateAction<DataPoint[]>>
): void => {
  const finalData = [...prevList, currentData];

  saveToLocalStorage("items", finalData.slice(-2 * CONFIG.CHART_DATA_POINTS));
  setTimeSeriesData(finalData.slice(-CONFIG.CHART_DATA_POINTS));

  const transition = checkTransition(prevList, currentData, currentEpisode);

  if (transition) {
    setCurrentEpisode(transition.episode);
    setAlert((prev) => [...prev, transition.alert]);
  }
};

export default function Home() {
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [alert, setAlert] = useState<Alert[]>([]);

  const { data } = useQuery({
    queryKey: ["cpu-load"],
    queryFn: () => fetch("/api/cpu-load").then((res) => res.json()),
    refetchInterval: CONFIG.POLL_INTERVAL,
  });

  // Load initial data from localStorage
  useEffect(() => {
    const savedData = loadFromLocalStorage("items");
    if (savedData.length > 0) {
      setTimeSeriesData(savedData);
    }
  }, []);

  // process data point on each response
  useEffect(() => {
    if (data) {
      processNewDataPoint(
        timeSeriesData,
        data,
        currentEpisode,
        setCurrentEpisode,
        setAlert,
        setTimeSeriesData
      );
    }
  }, [data]);

  return (
    <div className={styles.container}>
      <div>current value: {data?.loadAverage}</div>

      {currentEpisode && (
        <div>
          {currentEpisode.state} since {currentEpisode.startTime}
        </div>
      )}

      {timeSeriesData.length === 0 ? (
        <p>Collecting CPU data...</p>
      ) : (
        <TimeSeriesChart data={timeSeriesData} />
      )}


      {alert.length > 0 && (
        <div>
          {alert
            .slice(-5)
            .reverse()
            .map((alertItem, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  alertItem.type === "recovery"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="font-medium">
                  {alertItem.type === "recovery" ? "✅" : "⚠️"}{" "}
                  {alertItem.message}
                </div>
                {alertItem.timestamp && (
                  <div className="text-sm opacity-75">
                    {new Date(alertItem.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
