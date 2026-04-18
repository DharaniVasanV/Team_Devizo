import React from 'react';
import { MapPin } from 'lucide-react';

const LiveWeatherWidget = ({ status = 'normal' }) => {
  return (
    <div className="w-full bg-[#0b1f3a] text-white p-4 font-['Inter',_sans-serif]">
      <div className="border-t border-white/10 pt-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-400 font-bold text-sm">Live Conditions</h3>
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <MapPin size={14} className="text-slate-400" />
            <span>Bengaluru</span>
          </div>
        </div>

        {/* Data Container */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-xl">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-black/20 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
              <span className="text-blue-400 text-2xl drop-shadow-md">🌧️</span>
              <span className="font-bold text-sm">50 mm</span>
            </div>
            <div className="bg-black/20 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
              <span className="text-yellow-400 text-2xl drop-shadow-md">🌡️</span>
              <span className="font-bold text-sm">38°C</span>
            </div>
            <div className="bg-black/20 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
              <span className="text-purple-400 text-2xl drop-shadow-md">🌫️</span>
              <span className="font-bold text-sm">150 AQI</span>
            </div>
          </div>

          {/* Dynamic Status Badge */}
          {status === 'normal' ? (
            <div className="w-full py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center text-sm font-bold flex items-center justify-center gap-2">
               Normal Conditions
            </div>
          ) : (
            <div className="w-full py-2 px-3 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-center text-sm font-bold flex items-center justify-center gap-2">
               High Rain Risk
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveWeatherWidget;
