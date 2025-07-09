'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import styles from "./page.module.css";
import { DataPoint } from '@/lib/definitions'

export default function Home() {

  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const { data } = useQuery({
    queryKey: ['cpu-load'],
    queryFn: () => fetch('/api/cpu-load').then(res => res.json()),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data) {
      setTimeSeriesData(prev => {
        const updated = [...prev, {
          timestamp: data.timestamp,
          loadAverage: data.loadAverage
        }];
        if (updated.length > 60) {
          return updated.slice(-60);
        }
        return updated
      });
    }
  }, [data]);


  return (
    <div className={styles.container}>
      <div>
        {data?.loadAverage}
      </div>
      <div>
        {JSON.stringify(timeSeriesData)}
      </div>
    </div>
  );
}
