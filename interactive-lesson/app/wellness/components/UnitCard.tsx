import React from 'react';
import { Unit } from '../types';

interface UnitCardProps {
  unit: Unit;
  progress: number;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, progress }) => {
  return (
    <div className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-100 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[100%] -z-0 opacity-50 group-hover:scale-110 transition-transform origin-top-right"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white"
            style={{ backgroundColor: unit.color }}
          >
            {unit.icon}
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-black text-slate-500 uppercase tracking-wider border border-slate-200">
            {progress}%
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {unit.name}
        </h3>
        
        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">
          {unit.description}
        </p>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: unit.color }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
