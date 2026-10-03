import React, { useState } from 'react';
import { Activity, ArrowDownCircle, ArrowUpCircle, HardDrive } from 'lucide-react';

export default function TrafficChart({ data = [], range = '1h', onRangeChange }) {
  const ranges = ['1H', '6H', '24H', '7D'];

  const formatRate = (bytesPerSec) => {
    if (bytesPerSec === undefined || bytesPerSec === null || bytesPerSec < 0) return '0 B/s';
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-[#444444] mb-3" />
        <h4 className="font-mono font-semibold text-sm text-[#888888] uppercase">
          No historical traffic data available
        </h4>
        <p className="text-xs text-[#666666] font-sans mt-1 max-w-md">
          Start the local Python collector agent to capture real-time interface throughput and bandwidth samples.
        </p>

        {onRangeChange && (
          <div className="flex items-center gap-1 mt-5 bg-[#141414] p-1 rounded-lg border border-[#222222]">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r.toLowerCase())}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  range.toUpperCase() === r
                    ? 'bg-[#222222] text-[#F5F5F5] font-bold'
                    : 'text-[#888888] hover:text-[#F5F5F5]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Calculate maximum value for normalization
  const maxDownload = Math.max(...data.map((d) => d.bytes_recv_rate || 0), 1024);
  const maxUpload = Math.max(...data.map((d) => d.bytes_sent_rate || 0), 1024);
  const maxVal = Math.max(maxDownload, maxUpload);

  const latestSample = data[data.length - 1];

  return (
    <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-mono font-bold text-sm text-[#F5F5F5] uppercase tracking-wider">
              NETWORK BANDWIDTH METRICS
            </h3>
          </div>
          <p className="text-xs text-[#888888] font-sans mt-0.5">
            Real interface throughput recorded by local collector agent
          </p>
        </div>

        {/* Range Buttons */}
        {onRangeChange && (
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-[#222222]">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r.toLowerCase())}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                  range.toUpperCase() === r
                    ? 'bg-[#262626] text-[#F5F5F5] font-bold shadow-sm'
                    : 'text-[#888888] hover:text-[#F5F5F5]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Rate Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] flex items-center gap-2.5">
          <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[#777777] text-[10px] uppercase block">Current Download Rate</span>
            <span className="text-emerald-400 font-bold text-sm">
              {formatRate(latestSample?.bytes_recv_rate)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] flex items-center gap-2.5">
          <ArrowUpCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-[#777777] text-[10px] uppercase block">Current Upload Rate</span>
            <span className="text-sky-400 font-bold text-sm">
              {formatRate(latestSample?.bytes_sent_rate)}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <div>
            <span className="text-[#777777] text-[10px] uppercase block">Active Interface</span>
            <span className="text-[#F5F5F5] font-semibold truncate block">
              {latestSample?.interface || 'Wi-Fi / Ethernet'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas / Bar Visualizer */}
      <div className="h-48 flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 border-b border-[#1C1C1C] relative bg-[#070707] rounded-lg">
        {/* Horizontal reference grid lines */}
        <div className="absolute inset-x-0 top-1/4 border-b border-[#171717] pointer-events-none" />
        <div className="absolute inset-x-0 top-2/4 border-b border-[#171717] pointer-events-none" />
        <div className="absolute inset-x-0 top-3/4 border-b border-[#171717] pointer-events-none" />

        {data.slice(-30).map((item, idx) => {
          const dlHeight = Math.min(100, Math.max(8, (item.bytes_recv_rate / maxVal) * 100));
          const ulHeight = Math.min(100, Math.max(8, (item.bytes_sent_rate / maxVal) * 100));

          return (
            <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-[#141414] border border-[#2D2D2D] px-2.5 py-1.5 rounded text-[10px] font-mono whitespace-nowrap text-[#F5F5F5] shadow-xl">
                <div className="text-emerald-400 font-bold">Down: {formatRate(item.bytes_recv_rate)}</div>
                <div className="text-sky-400 font-bold">Up: {formatRate(item.bytes_sent_rate)}</div>
                <div className="text-[#777777] text-[9px]">{new Date(item.timestamp).toLocaleTimeString()}</div>
              </div>

              {/* Download Bar */}
              <div
                style={{ height: `${dlHeight}%` }}
                className="w-full max-w-[12px] bg-emerald-500/80 rounded-t-sm transition-all"
              />

              {/* Upload Bar */}
              <div
                style={{ height: `${ulHeight}%` }}
                className="w-full max-w-[12px] bg-sky-500/80 rounded-t-sm transition-all"
              />
            </div>
          );
        })}
      </div>

      {/* Legend & Timestamp */}
      <div className="flex items-center justify-between text-xs font-mono text-[#888888] pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            Download Throughput
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            Upload Throughput
          </span>
        </div>
        <span className="text-[11px] text-[#666666]">
          {data.length} telemetry sample{data.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
