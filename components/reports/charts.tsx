'use client'

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts'
import { formatCurrency } from '@/lib/formatters'
import { useTheme } from 'next-themes'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface LoanDistributionProps {
    data: { name: string; value: number }[]
}

export function LoanDistributionChart({ data }: LoanDistributionProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }: any) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

interface PaymentHistoryProps {
    data: { name: string; paid: number; pending: number }[]
}

export function PaymentHistoryChart({ data }: PaymentHistoryProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₺${value / 1000}k`}
                    />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="paid" name="Ödenen" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Bekleyen" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

interface ProjectionProps {
    data: { name: string; remaining: number }[]
}

export function FutureProjectionChart({ data }: ProjectionProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₺${value / 1000}k`}
                    />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Area
                        type="monotone"
                        dataKey="remaining"
                        name="Kalan Anapara"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRemaining)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
