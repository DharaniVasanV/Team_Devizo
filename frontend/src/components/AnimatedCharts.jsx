import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const data = [
    { name: 'Mon', income: 400 },
    { name: 'Tue', income: 300 },
    { name: 'Wed', income: 200 },
    { name: 'Thu', income: 278 },
    { name: 'Fri', income: 189 },
    { name: 'Sat', income: 239 },
    { name: 'Sun', income: 349 },
];

const AnimatedCharts = () => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                    />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
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
            </ResponsiveContainer>
        </div>
    );
};

export default AnimatedCharts;
