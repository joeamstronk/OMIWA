import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  MessageSquare,
  Zap,
  Calendar,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Historical 14-day daily metrics dataset
const DAILY_METRICS_DATA = [
  {
    date: '10 Okt',
    day: 'Jum',
    inbound: 245,
    outbound: 310,
    total: 555,
    avgResponseSec: 68,
    slaTarget: 60,
    resolvedChats: 88,
  },
  {
    date: '11 Okt',
    day: 'Sab',
    inbound: 190,
    outbound: 235,
    total: 425,
    avgResponseSec: 54,
    slaTarget: 60,
    resolvedChats: 62,
  },
  {
    date: '12 Okt',
    day: 'Min',
    inbound: 142,
    outbound: 180,
    total: 322,
    avgResponseSec: 49,
    slaTarget: 60,
    resolvedChats: 45,
  },
  {
    date: '13 Okt',
    day: 'Sen',
    inbound: 380,
    outbound: 460,
    total: 840,
    avgResponseSec: 72,
    slaTarget: 60,
    resolvedChats: 134,
  },
  {
    date: '14 Okt',
    day: 'Sel',
    inbound: 410,
    outbound: 520,
    total: 930,
    avgResponseSec: 58,
    slaTarget: 60,
    resolvedChats: 152,
  },
  {
    date: '15 Okt',
    day: 'Rab',
    inbound: 395,
    outbound: 490,
    total: 885,
    avgResponseSec: 51,
    slaTarget: 60,
    resolvedChats: 140,
  },
  {
    date: '16 Okt',
    day: 'Kam',
    inbound: 430,
    outbound: 540,
    total: 970,
    avgResponseSec: 46,
    slaTarget: 60,
    resolvedChats: 165,
  },
  {
    date: '17 Okt',
    day: 'Jum',
    inbound: 360,
    outbound: 440,
    total: 800,
    avgResponseSec: 53,
    slaTarget: 60,
    resolvedChats: 120,
  },
  {
    date: '18 Okt',
    day: 'Sab',
    inbound: 210,
    outbound: 260,
    total: 470,
    avgResponseSec: 44,
    slaTarget: 60,
    resolvedChats: 70,
  },
  {
    date: '19 Okt',
    day: 'Min',
    inbound: 165,
    outbound: 195,
    total: 360,
    avgResponseSec: 39,
    slaTarget: 60,
    resolvedChats: 55,
  },
  {
    date: '20 Okt',
    day: 'Sen',
    inbound: 450,
    outbound: 580,
    total: 1030,
    avgResponseSec: 45,
    slaTarget: 60,
    resolvedChats: 168,
  },
  {
    date: '21 Okt',
    day: 'Sel',
    inbound: 485,
    outbound: 615,
    total: 1100,
    avgResponseSec: 41,
    slaTarget: 60,
    resolvedChats: 182,
  },
  {
    date: '22 Okt',
    day: 'Rab',
    inbound: 420,
    outbound: 530,
    total: 950,
    avgResponseSec: 38,
    slaTarget: 60,
    resolvedChats: 155,
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
          <span>{label} ({data?.day})</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            {data?.total} Total Pesan
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              Pesan Masuk (Inbound):
            </span>
            <span className="font-bold text-white font-mono">{data?.inbound}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 mr-1.5" />
              Pesan Keluar (Outbound):
            </span>
            <span className="font-bold text-white font-mono">{data?.outbound}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span className="flex items-center text-amber-400">
              <Clock className="w-3 h-3 mr-1.5 text-amber-400" />
              Avg Response Time:
            </span>
            <span className="font-bold text-amber-300 font-mono">
              {data?.avgResponseSec} detik
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Target SLA Perusahaan:</span>
            <span className="font-mono text-slate-300">&lt; {data?.slaTarget}s</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceMetricsWidget: React.FC = () => {
  const { sessions } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');
  const [viewMetric, setViewMetric] = useState<'composite' | 'volume' | 'response_time'>('composite');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const chartData = timeRange === '7d' ? DAILY_METRICS_DATA.slice(-7) : DAILY_METRICS_DATA;

  // Calculate Aggregates
  const totalInbound = chartData.reduce((acc, curr) => acc + curr.inbound, 0);
  const totalOutbound = chartData.reduce((acc, curr) => acc + curr.outbound, 0);
  const avgResponseTime = Math.round(
    chartData.reduce((acc, curr) => acc + curr.avgResponseSec, 0) / chartData.length
  );
  const bestDay = [...chartData].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/40">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Performance Metrics & Trends
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analisis tren volume pesan harian WhatsApp dan performa kecepatan respon tim Call Center (SLA).
          </p>
        </div>

        {/* Controls: Metric Mode & Time Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel selector */}
          <div className="relative">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">🌐 Semua Saluran ({sessions.length})</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric View Mode Toggle */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setViewMetric('composite')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMetric === 'composite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Tren
            </button>
            <button
              onClick={() => setViewMetric('volume')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMetric === 'volume'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Volume Pesan
            </button>
            <button
              onClick={() => setViewMetric('response_time')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMetric === 'response_time'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Response Time
            </button>
          </div>

          {/* Range Selector */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                timeRange === '7d'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                timeRange === '14d'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Hari
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Micro KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block flex items-center">
            <MessageSquare className="w-3 h-3 text-emerald-400 mr-1" />
            Total Volume ({timeRange.toUpperCase()})
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-white">
              {(totalInbound + totalOutbound).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +14.6%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {totalInbound.toLocaleString()} In / {totalOutbound.toLocaleString()} Out
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block flex items-center">
            <Clock className="w-3 h-3 text-amber-400 mr-1" />
            Avg First Response Time
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-amber-300">
              {avgResponseTime} detik
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              <ArrowDownRight className="w-3 h-3" /> -18.2%
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 block">
            ✓ 22s lebih cepat dari SLA Target (60s)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block flex items-center">
            <Zap className="w-3 h-3 text-teal-400 mr-1" />
            Hari Tersibuk (Peak Day)
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-white">
              {bestDay?.date}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">({bestDay?.day})</span>
          </div>
          <span className="text-[10px] text-teal-300 block">
            {bestDay?.total} Pesan ({bestDay?.inbound} Masuk)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block flex items-center">
            <CheckCircle2 className="w-3 h-3 text-purple-400 mr-1" />
            SLA Compliance Rate
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-purple-300">97.4%</span>
            <span className="text-[10px] text-purple-400 font-semibold">Tier A+</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Pesan terbalas &lt; 2 menit
          </span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Gradient for Inbound Area */}
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient for Outbound Area */}
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            {/* Left Y Axis for Volume */}
            {(viewMetric === 'composite' || viewMetric === 'volume') && (
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
            )}

            {/* Right Y Axis for Response Time (seconds) */}
            {(viewMetric === 'composite' || viewMetric === 'response_time') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="s"
                domain={[0, 90]}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />

            {/* Reference Line for Target SLA 60s */}
            {(viewMetric === 'composite' || viewMetric === 'response_time') && (
              <ReferenceLine
                yAxisId="right"
                y={60}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'SLA Limit (60s)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Message Volume Inbound */}
            {(viewMetric === 'composite' || viewMetric === 'volume') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="inbound"
                name="Pesan Masuk (Inbound)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorInbound)"
              />
            )}

            {/* Message Volume Outbound */}
            {(viewMetric === 'composite' || viewMetric === 'volume') && (
              <Bar
                yAxisId="left"
                dataKey="outbound"
                name="Pesan Keluar (Outbound)"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                barSize={12}
                opacity={0.85}
              />
            )}

            {/* Response Time Line */}
            {(viewMetric === 'composite' || viewMetric === 'response_time') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseSec"
                name="Avg Response Time (detik)"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#1e293b' }}
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Widget Footer Insights */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Sinkronisasi otomatis dari server gateway WhatsApp setiap 5 menit.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium">
          <span className="text-emerald-400">● Inbound Area</span>
          <span className="text-sky-400">■ Outbound Bar</span>
          <span className="text-amber-400">― Response Time Line</span>
        </div>
      </div>
    </div>
  );
};
