import { checkTransition, formatPercentage, getColorCode } from './utils';
import { DataPoint, Episode, CONFIG } from './definitions';

describe('alerting logic', () => {
  const createDataPoint = (loadAverage: number, timestamp: string): DataPoint => ({
    loadAverage,
    timestamp,
    // add other required DataPoint properties
  });

  // returns null when not enough data




  // high load stuff:

  // throws high load alert if the batch is  ALERT_DATA_POINTS elements at last is high [{normal}, {high}, {high}, {high}, {high}, {high}, {high}, {high}, {high}, {high, timestamp: this One}, {high}, ...,] AND it should set the episode to load type 'high_load' and startTime: timestamp

  // while there is current episode of high_load AND it keeps getting high load consistently - does not throw alert, episode stays the same 




  // recovery load stuff:

  // throws recovery alert if the batch is  ALERT_DATA_POINTS elements at last is high [{normal}, {high}, {high}, {high}, {high}, {high}, {high}, {high}, {high}, {high}, {normal, timestamp}] AND it should sey the episode to 'normal' and startTime: timestamp

  // while there is current episode of 'normal' AND  if it keeps getting more let's say (high,normal,high) datapoints episode doesnt change, doesnt throw alert


  describe('checkTransition', () => {
    it('should return null when not enough data points', () => {
      const prevList: DataPoint[] = [
        createDataPoint(0.2, '2025-01-01T10:00:00Z')
      ];
      const currentData = createDataPoint(0.5, '2025-01-01T10:01:00Z');
      
      const result = checkTransition(prevList, currentData, null);
      expect(result).toBeNull();
    });

    it('should detect high load transition', () => {
      // Create enough high load data points
      const prevList: DataPoint[] = Array(CONFIG.ALERT_DATA_POINTS - 1)
        .fill(null)
        .map((_, i) => createDataPoint(0.4, `2025-01-01T10:${i.toString().padStart(2, '0')}:00Z`));
      
      const currentData = createDataPoint(0.4, '2025-01-01T10:10:00Z');
      
      const result = checkTransition(prevList, currentData, null);
      
      expect(result).not.toBeNull();
      expect(result?.episode.state).toBe('high_load');
      expect(result?.alert.type).toBe('load');
    });

    it('should detect recovery transition', () => {
      // Setup: previous high load episode
      const currentEpisode: Episode = {
        state: 'high_load',
        startTime: '2025-01-01T10:00:00Z'
      };
      
      // Previous data all high load
      const prevList: DataPoint[] = Array(CONFIG.ALERT_DATA_POINTS - 1)
        .fill(null)
        .map((_, i) => createDataPoint(0.4, `2025-01-01T10:${i.toString().padStart(2, '0')}:00Z`));
      
      // Current data is normal
      const currentData = createDataPoint(0.2, '2025-01-01T10:10:00Z');
      
      const result = checkTransition(prevList, currentData, currentEpisode);
      
      expect(result?.episode.state).toBe('normal');
      expect(result?.alert.type).toBe('recovery');
      expect(result?.alert.message).toContain('Recovery after');
    });
  });

  describe('utility functions', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(0.371)).toBe('37.10%');
      expect(formatPercentage(1.0)).toBe('100.00%');
    });

    it('should return correct color codes', () => {
      expect(getColorCode(0.1)).toBe('green');
      expect(getColorCode(0.25)).toBe('yellow'); // assuming threshold is 0.3
      expect(getColorCode(0.4)).toBe('red');
    });
  });
});