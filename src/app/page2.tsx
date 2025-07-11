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

const addAlert = (
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>,
  newAlert: Alert
) => {
  setAlert(prev => prev ? [...prev, newAlert] : [newAlert]);
};

const checkForRecoveryAlert = (
  lastBatchExceptLast: DataPoint[],
  currentData: DataPoint,
  currentEpisode: Episode | null,
  setCurrentEpisode: React.Dispatch<React.SetStateAction<Episode | null>>,
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>
) => {
  const isLastBatchHigh = lastBatchExceptLast.every(
    item => item.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD
  );

  if (isLastBatchHigh && currentData.loadAverage < CONFIG.HIGH_LOAD_THRESHOLD) {
    const duration = currentEpisode?.startTime 
      ? Date.parse(currentData.timestamp) - Date.parse(currentEpisode.startTime)
      : 0;

    setCurrentEpisode({
      state: "normal",
      startTime: currentData.timestamp,
      duration
    });

    addAlert(setAlert, {
      type: "recovery",
      message: `CPU has recovered from heavy load (lasted ${Math.floor(duration / 60000)}m)`,
      timestamp: currentData.timestamp
    });
  }
};

const checkForLoadAlert = (
  finalData: DataPoint[],
  currentEpisode: Episode | null,
  setCurrentEpisode: React.Dispatch<React.SetStateAction<Episode | null>>,
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>
) => {
  const isFullBatchHigh = finalData.slice(-CONFIG.ALERT_DATA_POINTS).every(
    item => item.loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD
  );

  if (isFullBatchHigh && currentEpisode?.state !== "high_load") {
    const startTime = finalData[finalData.length - CONFIG.ALERT_DATA_POINTS].timestamp;
    
    setCurrentEpisode({
      state: "high_load",
      startTime
    });

    addAlert(setAlert, {
      type: "load",
      message: "CPU under heavy load for 2+ minutes",
      timestamp: startTime
    });
  }
};

const processNewDataPoint = (
  prev: DataPoint[],
  newData: DataPoint,
  currentEpisode: Episode | null,
  setCurrentEpisode: React.Dispatch<React.SetStateAction<Episode | null>>,
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>
): DataPoint[] => {
  const finalData = [...prev, newData];

  // Check for alerts if we have enough data points
  if (finalData.length >= CONFIG.ALERT_DATA_POINTS) {
    const lastBatchExceptLast = prev.slice(-(CONFIG.ALERT_DATA_POINTS - 1));
    
    // Check for recovery (previous batch was high, current point is low)
    checkForRecoveryAlert(
      lastBatchExceptLast,
      newData,
      currentEpisode,
      setCurrentEpisode,
      setAlert
    );

    // Check for load alert (full batch including current is high)
    checkForLoadAlert(
      finalData,
      currentEpisode,
      setCurrentEpisode,
      setAlert
    );
  }

  // Save extended data to localStorage for persistence
  saveToLocalStorage(
    "items",
    finalData.slice(-2 * CONFIG.CHART_DATA_POINTS)
  );

  // Return data for chart display
  return finalData.slice(-CONFIG.CHART_DATA_POINTS);
};

export default function Home() {
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [alert, setAlert] = useState<Alert[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const { data, error: isErrorCpuSnapshot } = useQuery({
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

  // Process new data from API
  useEffect(() => {
    if (data) {
      setLastUpdateTime(data.timestamp);
      
      setTimeSeriesData(prev => {
        const newData: DataPoint = {
          timestamp: data.timestamp,
          loadAverage: data.loadAverage,
        };

        return processNewDataPoint(
          prev,
          newData,
          currentEpisode,
          setCurrentEpisode,
          setAlert
        );
      });
    }
  }, [data, currentEpisode]);

  const getCurrentLoadColor = (loadAverage: number) => {
    if (loadAverage >= CONFIG.HIGH_LOAD_THRESHOLD) return "text-red-600";
    if (loadAverage >= 0.7) return "text-yellow-600";
    return "text-green-600";
  };

  const formatLoadAverage = (loadAverage: number) => {
    return (loadAverage * 100).toFixed(1) + "%";
  };

  return (
    <div className={styles.container}>
      {/* Current Load Display */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">CPU Load Monitor</h1>
        
        {data && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-lg mb-2">Current CPU Load:</div>
            <div className={`text-3xl font-mono ${getCurrentLoadColor(data.loadAverage)}`}>
              {formatLoadAverage(data.loadAverage)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Current Episode Status */}
        {currentEpisode && currentEpisode.state === "high_load" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-semibold">⚠️ System Under Heavy Load</div>
            <div className="text-red-600 text-sm">
              Since: {new Date(currentEpisode.startTime).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {isErrorCpuSnapshot && lastUpdateTime && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">
            Cannot connect to CPU monitor. Last update: {new Date(lastUpdateTime).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10-Minute CPU Load Trend</h2>
        {timeSeriesData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] border border-gray-300 rounded">
            <p className="text-gray-500">Collecting CPU data...</p>
          </div>
        ) : (
          <TimeSeriesChart data={timeSeriesData} />
        )}
      </div>

      {/* Alerts History */}
      {alert.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Recent Alerts</h2>
          <div className="space-y-2">
            {alert.slice(-5).reverse().map((alertItem, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  alertItem.type === 'recovery' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="font-medium">
                  {alertItem.type === 'recovery' ? '✅' : '⚠️'} {alertItem.message}
                </div>
                {alertItem.timestamp && (
                  <div className="text-sm opacity-75">
                    {new Date(alertItem.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}