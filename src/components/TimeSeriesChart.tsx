import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/lib/definitions'

type Props = {
  data: DataPoint[];
}

export default function TimeSeriesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
           tickFormatter={(value) => new Date(value).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        />
        <YAxis />
        <Line
          type="monotone" 
          dataKey="loadAverage" 
          stroke="#8884d8" 
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}