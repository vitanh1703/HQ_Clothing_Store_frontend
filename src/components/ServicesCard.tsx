import React from 'react';
import { Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import type { ServicesCardProps } from '../services/api';

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
};

const ServicesCard: React.FC<ServicesCardProps> = ({ iconName, title, description }) => {
  const IconComponent = iconMap[iconName] || Truck;
  const icon = <IconComponent size={32} strokeWidth={1} />;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 text-center shadow-2xl group hover:bg-white transition-all duration-500 rounded-sm">
      <div className="text-white mb-6 flex justify-center group-hover:text-black transition-all">{icon}</div>
      <h3 className="text-[13px] font-black uppercase text-white group-hover:text-black mb-3 transition-colors">{title}</h3>
      <p className="text-gray-300 group-hover:text-gray-500 text-[10px] uppercase tracking-wider transition-colors">{description}</p>
    </div>
  );
};

export default ServicesCard;