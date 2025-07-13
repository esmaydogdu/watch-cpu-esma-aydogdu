import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { DataPoint } from "@/lib/definitions";

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
          tickFormatter={(value) =>
            new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        />
        <YAxis />
         <Tooltip
          labelFormatter={(value) =>
            new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          }
          formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'CPU Load']}
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
