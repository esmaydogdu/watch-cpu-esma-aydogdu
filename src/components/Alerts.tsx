import { Alert } from "@/lib/definitions";
import { useState } from "react";
import { printTime } from "@/lib/utils";
import styles from "./Alerts.module.css";

export default function Alerts({ alerts }: { alerts: Alert[] }) {
  const [showAllHighLoad, setShowAllHighLoad] = useState(false);
  const [showAllRecovery, setShowAllRecovery] = useState(false);

  const getTime = (date: string): number => new Date(date).getTime();

  const highLoadAlerts = alerts
    .filter((alert) => alert.type === "load")
    .map((alert) => ({ ...alert, timestamp: getTime(alert.timestamp) }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const recoveryAlerts = alerts
    .filter((alert) => alert.type === "recovery")
    .map((alert) => ({ ...alert, timestamp: getTime(alert.timestamp) }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const visibleHighLoadAlerts = showAllHighLoad
    ? highLoadAlerts
    : highLoadAlerts.slice(0, 5);
  const visibleRecoveryAlerts = showAllRecovery
    ? recoveryAlerts
    : recoveryAlerts.slice(0, 5);

  return (
    <div className={styles.alertsList}>
      <ul className={styles.alertList}>
        <h3 className={styles.alertsListHeader}>
          ⚠️ High Load Alerts ({highLoadAlerts.length})
        </h3>
        {visibleHighLoadAlerts.map((alert, index) => (
          <li key={index} className={styles.alertsListItem}>
            <div className="font-medium">
              {printTime(alert.timestamp)}: {alert.message}
            </div>
          </li>
        ))}
        {highLoadAlerts.length > 5 && (
          <button
            onClick={() => setShowAllHighLoad(!showAllHighLoad)}
            className={styles.showMoreButton}
          >
            {showAllHighLoad
              ? "▲ Show less"
              : `▼ Show more (${highLoadAlerts.length - 5})`}
          </button>
        )}
      </ul>
      <ul className={styles.alertList}>
        <h3 className={styles.alertsListHeader}>
          ✅ Recovery Alerts ({recoveryAlerts.length})
        </h3>
        {visibleRecoveryAlerts.map((alert, index) => (
          <li key={index} className={styles.alertsListItem}>
            <div className="font-medium">
              {printTime(alert.timestamp)}: {alert.message}
            </div>
          </li>
        ))}
        {recoveryAlerts.length > 5 && (
          <button
            onClick={() => setShowAllRecovery(!showAllRecovery)}
            className={styles.showMoreButton}
          >
            {showAllRecovery
              ? "▲ Show less"
              : `▼ Show more (${recoveryAlerts.length - 5})`}
          </button>
        )}
      </ul>
    </div>
  );
}
