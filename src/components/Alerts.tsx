import { Alert } from "@/lib/definitions";
import { useState } from "react";

export default function Alerts({ alerts }: { alerts: Alert[] }) {
  const [showAllHighLoad, setShowAllHighLoad] = useState(false);
  const [showAllRecovery, setShowAllRecovery] = useState(false);

  const highLoadAlerts = alerts
    .filter((alert) => alert.type === "load")
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const recoveryAlerts = alerts
    .filter((alert) => alert.type === "recovery")
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const visibleHighLoadAlerts = showAllHighLoad
    ? highLoadAlerts
    : highLoadAlerts.slice(0, 5);
  const visibleRecoveryAlerts = showAllRecovery
    ? recoveryAlerts
    : recoveryAlerts.slice(0, 5);

  return (
    <div>
      <div className="highload-alerts">
        <h3 className="font-medium text-red-800 mb-3">
          ⚠️ High Load Alerts ({highLoadAlerts.length})
        </h3>
        {visibleHighLoadAlerts.map((alert, index) => (
          <div key={index} className="p-3 rounded-lg border">
            <div className="font-medium">⚠️ {alert.message}</div>
          </div>
        ))}
        {highLoadAlerts.length > 5 && (
          <button
            onClick={() => setShowAllHighLoad(!showAllHighLoad)}
            className="text-blue-600 text-sm hover:underline mt-2"
          >
            {showAllHighLoad
              ? "Show less"
              : `Show ${highLoadAlerts.length - 5} more`}
          </button>
        )}
      </div>
      <div className="recovery-alerts">
        <h3 className="font-medium text-red-800 mb-3">
          ✅ Recovery Alerts ({highLoadAlerts.length})
        </h3>
        {visibleRecoveryAlerts.map((alert, index) => (
          <div key={index} className="p-3 rounded-lg border">
            <div className="font-medium">✅ {alert.message}</div>
          </div>
        ))}
        {recoveryAlerts.length > 5 && (
          <button
            onClick={() => setShowAllRecovery(!showAllRecovery)}
            className="text-blue-600 text-sm hover:underline mt-2"
          >
            {showAllRecovery
              ? "Show less"
              : `Show ${recoveryAlerts.length - 5} more`}
          </button>
        )}
      </div>
    </div>
  );
}
