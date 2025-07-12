"use client";

import { useQuery } from "@tanstack/react-query";
import { CONFIG, DataPoint, Alert, Episode } from "@/lib/definitions";
import { checkTransition, formatPercentage } from "@/lib/utils";
import { useState, useEffect } from "react";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import styles from "./page.module.css";

const loadFromLocalStorage = (key: string) => {
  try {
    if (typeof window === "undefined") return null;
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : null;
  } catch (e) {
    console.error("Error loading from local storage", e);
  }
};

const saveToLocalStorage = (
  key: string,
  data: DataPoint[] | Alert[] | Episode
) => {
  try {
    if (typeof window === "undefined") return null;
    console.log('saved on ls:', data)
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to local storage", e);
  }
};

const processNewDataPoint = (
  prevList: DataPoint[],
  currentData: DataPoint,
  currentEpisode: Episode | null,
  setCurrentEpisode: React.Dispatch<React.SetStateAction<Episode | null>>,
  setAlert: React.Dispatch<React.SetStateAction<Alert[]>>,
  setTimeSeriesData: React.Dispatch<React.SetStateAction<DataPoint[]>>
): void => {
  const currentList = [...prevList, currentData];

  setTimeSeriesData(currentList.slice(-CONFIG.CHART_DATA_POINTS));

  const transition = checkTransition(prevList, currentData, currentEpisode);
  
  if (transition) {
    setCurrentEpisode(() => {
      saveToLocalStorage("episode", transition.episode);
      return transition.episode;
    });

    setAlert((prev) => {
      saveToLocalStorage("alerts", [...prev, transition.alert]);
      return [...prev, transition.alert];
    });
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

  useEffect(() => {
    const savedData = loadFromLocalStorage("items");
    const savedCurrentEpisode = loadFromLocalStorage("episode");

    // stale data if 15 mins > old
    const cutOffDate = Date.now() - 1000 * 60 * 15;
    const freshData = savedData.filter(
      (d: DataPoint) => new Date(d.timestamp).getTime() > cutOffDate
    );
    console.log('freshData', freshData)
    console.log('savedData', savedData)
    if (freshData.length !== savedData.length) {
      console.log('here?')
      saveToLocalStorage("items", freshData);
    }

    if (freshData.length > 0) {
      setTimeSeriesData(savedData);
    }
    if (savedCurrentEpisode) {
      setCurrentEpisode(savedCurrentEpisode);
    }
  }, []);

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
      <div className={styles.top}>
        {
          data && (
            <div className={styles.card}>
              <p>CPU Rate:</p>
              <p>{formatPercentage(data?.loadAverage)}</p>
            </div>
          )
        }
        
        {
          currentEpisode && (
            <div className={styles.card}>
              {currentEpisode.state} since {currentEpisode.startTime}
            </div>
          )
        }
      </div>

      {
        timeSeriesData.length === 0 ? (
          <p>Collecting CPU data...</p>
        ) : (
          <TimeSeriesChart data={timeSeriesData} />
        )
      }

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
