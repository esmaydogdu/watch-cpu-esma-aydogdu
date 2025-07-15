"use client";

import { useQuery } from "@tanstack/react-query";
import { CONFIG, DataPoint, Alert, Episode, EpisodeText } from "@/lib/definitions";
import { checkTransition, formatPercentage, getColorCode } from "@/lib/utils";
import { useState, useEffect } from "react";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import Alerts from "@/components/Alerts";
import styles from "./page.module.css";

const cutOffDate = Date.now() - 1000 * 60 * 15;

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
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>,
  setTimeSeriesData: React.Dispatch<React.SetStateAction<DataPoint[]>>
): void => {
  const currentList = [...prevList, currentData];

  setTimeSeriesData(currentList.slice(-CONFIG.CHART_DATA_POINTS));
  saveToLocalStorage("items", currentList.slice(-CONFIG.CHART_DATA_POINTS));
  const transition = checkTransition(prevList, currentData, currentEpisode);

  if (transition) {
    setCurrentEpisode(() => {
      saveToLocalStorage("episode", transition.episode);
      return transition.episode;
    });

    setAlerts((prev) => {
      saveToLocalStorage("alerts", [...prev, transition.alert]);
      return [...prev, transition.alert];
    });
  }
};

export default function Home() {
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const { data } = useQuery({
    queryKey: ["cpu-load"],
    queryFn: () => fetch("/api/cpu-load").then((res) => res.json()),
    refetchInterval: CONFIG.POLL_INTERVAL,
  });

  useEffect(() => {
    const savedData = loadFromLocalStorage("items");
    const savedCurrentEpisode = loadFromLocalStorage("episode");
    const savedAlerts = loadFromLocalStorage("alerts");

    if (savedData && savedData.length) {
      const freshData = savedData.filter(
        (d: DataPoint) => new Date(d.timestamp).getTime() > cutOffDate
      );
      setTimeSeriesData(freshData);
      if (freshData.length !== savedData.length) {
        saveToLocalStorage("items", freshData);
      }
    }

    // persist the history
    if (savedAlerts && savedAlerts.length) {
      if (
        new Date(savedAlerts[savedAlerts.length - 1].timestamp).getTime() >
        cutOffDate
      ) {
        setAlerts(savedAlerts);
      } else {
        setAlerts([]);
        localStorage.removeItem("alerts");
      }
    }

    if (savedCurrentEpisode) {
      if (new Date(savedCurrentEpisode.startTime).getTime() > cutOffDate) {
        setCurrentEpisode(savedCurrentEpisode);
      } else {
        setCurrentEpisode(null);
        localStorage.removeItem("episode");
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      processNewDataPoint(
        timeSeriesData,
        data,
        currentEpisode,
        setCurrentEpisode,
        setAlerts,
        setTimeSeriesData
      );
    }
  }, [data]);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        
        {data && (
          <div className={styles.pageHeader}>
            <span
              className={`blinking blinking--${getColorCode(
                data?.loadAverage
              )}`}
            ></span>
            <p>CPU Load:</p>
            <div className={styles.cpuValue}>
              {formatPercentage(data?.loadAverage)}
            </div>
          </div>
        )}

        {currentEpisode && (
          <div className={styles.pageHeader}>
            <p>
            {EpisodeText[currentEpisode.state]}
            {new Date(currentEpisode.startTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {timeSeriesData.length === 0 ? (
        <p>Collecting CPU data...</p>
      ) : (
        <TimeSeriesChart data={timeSeriesData} />
      )}

      <Alerts alerts={alerts} />
    </div>
  );
}
