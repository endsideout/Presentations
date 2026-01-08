import React from 'react';

interface StatsCardProps {
  label: string; 
  value: string | number; 
  icon: string; 
  color: string; 
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className={`p-6 rounded-3xl ${color} bg-opacity-20 flex flex-col items-center justify-center gap-2 shadow-sm border-2 border-white/50`}>
      <div className="text-4xl mb-1">{icon}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
};

export default StatsCard;
