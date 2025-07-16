import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { DataPoint } from "@/lib/definitions";
import { printTime, formatPercentage } from "@/lib/utils";

type Props = {
  data: DataPoint[];
};

export default function TimeSeriesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
          domain={['dataMin', 'dataMax']}
          interval="preserveStartEnd"
          tickFormatter={printTime}
        />
        <YAxis />
         <Tooltip
          labelFormatter={printTime}
          formatter={(value) => {
            if (!Number(value)) {
              return ['--', 'CPU Load']
            } 
            return [`${formatPercentage(value as number)}%`, 'CPU Load']
          }}
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            borderRadius: '5px',
            color: 'white'
          }}
          labelStyle={{
            color: 'white'
          }}
        />
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
  );
}
