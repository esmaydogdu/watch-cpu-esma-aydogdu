import { checkTransition } from './utils';
import { CONFIG } from './definitions';
// import { dataList } from '../mocks/data';


const createDataPoint = (loadAverage: number, timestamp: string) => ({
  loadAverage,
  timestamp,
  cpuCount: 8
})

const createTestData = (count: number, loadAverage: number, startTime: Date = new Date()) => {
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(startTime.getTime() + (i * CONFIG.POLL_INTERVAL))
    return createDataPoint(loadAverage, timestamp.toISOString())
  })
}

const incidentIndex = CONFIG.CHART_DATA_POINTS - CONFIG.ALERT_DATA_POINTS + 1

const dataList = createTestData(300, 0.3)

const highLoadDataList = [...createTestData(240, 0.3), ...createTestData(60, 1)]

const currentDataNormal = {
  loadAverage: 0.2, timestamp: "2025-07-16T11:33:14.107Z", cpuCount: 8
}

const currentDataHigh = {
  loadAverage: 1, timestamp: "2025-07-16T11:33:14.107Z", cpuCount: 8
}




describe('checkTransition', () => {

  describe('insufficient data', () => {
    
    it ('returns null if not enough data points are provided', () => {
      const result = checkTransition(dataList.slice(0, CONFIG.ALERT_DATA_POINTS - 1), currentDataNormal, null);
      expect(result).toBeNull();
    })

     it('returns null when prevList is empty', () => {
      const result = checkTransition([], currentDataNormal, null);
      expect(result).toBeNull();
    });

  })

  describe('no state transitions', () => {

    it('returns null if no high-load for 2 mins or no recovery from a recent high-load', () => {
      const result = checkTransition(dataList, currentDataNormal, null);
      expect(result).toBeNull();
    })

    it('returns null when load fluctuates but never sustained high for full window', () => {
      const mixedData = createTestData(CONFIG.ALERT_DATA_POINTS - 1, 0.5).map((data, i) => {
        return i % 2 === 0 ? {
          ...data,
          loadAverage: 1
        } : data

   
      })

      const result = checkTransition(mixedData, currentDataNormal, null)
      expect(result).toBeNull()
    })
  })

  describe('high-load detection', () => {
    it('returns high-load alert and episode if it processes high-load fir 2 mins', () => {
      const result = checkTransition(highLoadDataList, currentDataHigh, null);

      expect(result?.alert?.type).toBe('load');
      expect(result?.episode?.state).toBe('high_load');
      expect(result?.episode?.startTime).toBe(highLoadDataList[incidentIndex].timestamp);
    })

    it ('does not keep returning alerts if high-load is persisting after throwing one alert already' , () => {
    const result = checkTransition(highLoadDataList, currentDataHigh, {
      state: 'high_load',
      startTime: highLoadDataList[incidentIndex].timestamp
    });

    expect(result?.alert).toBe(undefined);
  })
  })

  describe('recovery detection', () => {
    it ('returns recovery alert and episode if it had normal load after at least 2mins of high-load inputs', () => {
      const result = checkTransition(highLoadDataList, currentDataNormal, null);
      
      expect(result?.alert?.type).toBe('recovery');
      expect(result?.episode?.state).toBe('normal');
      expect(result?.episode?.startTime).toBe(currentDataNormal.timestamp);
    })

    it('calculates recovery duration correctly', () => {
      const startTime = new Date("2025-07-16T11:30:00.000Z");
      const endTime = new Date("2025-07-16T11:35:00.000Z"); // 5 minutes later
      
      const highLoadEpisode = {
        state: 'high_load' as const,
        startTime: startTime.toISOString()
      };
      
      const recoveryData = createDataPoint(0.3, endTime.toISOString());
      const prevData = createTestData(CONFIG.ALERT_DATA_POINTS - 1, 1, new Date(endTime.getTime() - (CONFIG.ALERT_DATA_POINTS - 1) * CONFIG.POLL_INTERVAL));
      
      const result = checkTransition(prevData, recoveryData, highLoadEpisode);
      expect(result?.alert?.type).toBe('recovery');
      expect(result?.alert?.message).toContain('5m high-load');
    });
  })
});