"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';



export interface AnalyticsDataPoint {
    name: string;
    alerts: number;
}

interface AnalyticsWidgetProps {
    data?: AnalyticsDataPoint[];
}

const DEFAULT_DATA: AnalyticsDataPoint[] = [
    { name: '00:00', alerts: 0 },
    { name: '04:00', alerts: 0 },
    { name: '08:00', alerts: 0 },
    { name: '12:00', alerts: 0 },
    { name: '16:00', alerts: 0 },
    { name: '20:00', alerts: 0 },
    { name: '23:59', alerts: 0 },
];

export default function AnalyticsWidget({ data = DEFAULT_DATA }: AnalyticsWidgetProps) {
    return (
        <div className="glass-card p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Incident Trends (24h)</h3>
                {/* Select removed for now as we are focusing on 24h view from logic */}
                <span className="text-xs text-gray-400">Live Data</span>
            </div>

            <div className="flex-1 w-full min-h-[200px] h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2E2BAC" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2E2BAC" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0A0A10', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="alerts"
                            stroke="#2E2BAC"
                            fillOpacity={1}
                            fill="url(#colorAlerts)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
