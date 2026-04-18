import React, { useState } from 'react';
import { Zap } from 'lucide-react';

const SimulateDisasterCard = () => {
  const [simulated, setSimulated] = useState(false);

  return (
    <div className="w-full bg-[#0b1f3a] p-4 text-white font-['Inter',_sans-serif]">
      <div className="relative p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="absolute left-0 top-0 w-1 h-full bg-purple-500"></div>
        
        <div className="flex items-start gap-4 mb-5">
          <div className="mt-1">
            <Zap className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">AI Payout Integration DEMO</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Force trigger the Parametric ML flow. Auto-calculates payout and credits instantly.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSimulated(true)}
          className="w-full bg-purple-600 hover:bg-purple-500 transition-colors rounded-xl py-3 px-4 text-white font-black uppercase text-sm tracking-wider shadow-[0_4px_20px_rgba(147,51,234,0.2)] mb-3 block"
        >
          SIMULATE DISASTER ⚡
        </button>

        {simulated && (
          <div className="w-full mt-3 bg-green-500/20 border border-green-500/30 rounded-xl py-3 px-4 text-center transition-all duration-300 ease-in-out">
            <span className="text-green-400 font-bold text-sm">💰 ₹2500 credited successfully! (Risk: high)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulateDisasterCard;
