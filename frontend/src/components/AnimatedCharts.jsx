import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { TrendingDown } from 'lucide-react';

const fallbackData = [
    { name: 'Mon', income: 0 },
    { name: 'Tue', income: 0 },
    { name: 'Wed', income: 0 },
    { name: 'Thu', income: 0 },
    { name: 'Fri', income: 0 },
    { name: 'Sat', income: 0 },
    { name: 'Sun', income: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
            }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>₹{payload[0].value}</p>
                {payload[0].payload.orders !== undefined && (
                    <p style={{ color: '#6366f1', fontSize: '11px', marginTop: '2px' }}>
                        {payload[0].payload.orders} order{payload[0].payload.orders !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const AnimatedCharts = ({ earningsData, chartType = 'area' }) => {
    console.log('[AnimatedCharts] Received earningsData:', earningsData);
    const data = earningsData && earningsData.length > 0 ? earningsData : fallbackData;
    const hasData = data.some(d => d.income > 0);

    if (!hasData) {
        return (
            <div className="h-64 w-full flex flex-col items-center justify-center text-slate-500">
                <TrendingDown size={40} className="mb-3 text-slate-600" />
                <p className="font-semibold text-lg">No Earnings Data</p>
                <p className="text-sm text-slate-600">Earnings will appear here once you start delivering</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="income" fill="url(#colorBar)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                    </BarChart>
                ) : (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="income" 
                            stroke="#6366f1" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorIncome)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default AnimatedCharts;
