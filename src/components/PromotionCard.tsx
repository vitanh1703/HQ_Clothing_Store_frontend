import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import type { PromotionCardProps } from '../services/api';

const PromotionCard: React.FC<PromotionCardProps> = ({ code, title, description, discountText }) => {
  return (
    <div className="group cursor-pointer h-full flex flex-col">
      <div className="relative overflow-hidden rounded-xl mb-6 bg-red-50 p-8 flex flex-col items-center justify-center shadow-lg border border-red-200">
        {/* Discount Badge Large */}
        <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <Flame size={24} className="fill-current animate-pulse" />
            <span className="text-3xl font-black">{discountText}</span>
          </div>
        </div>
        
        {/* Code Badge */}
        <div className="mb-4 bg-black text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider">
          {code}
        </div>
      </div>
      <div className="text-left flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          <p className="text-[9px] text-red-500 font-black uppercase tracking-wider">{code}</p>
        </div>
        <h3 className="text-base font-black uppercase mb-3 leading-tight group-hover:text-red-500 transition-colors duration-300 line-clamp-2 text-black">{title}</h3>
        <p className="text-gray-600 text-[11px] font-medium leading-relaxed mb-5 uppercase opacity-85 flex-1 line-clamp-2">{description}</p>
        <button className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 group/btn hover:text-red-500 transition-colors duration-300 w-fit px-4 py-2 rounded-lg hover:bg-red-50">
          <span>Áp Dụng Ngay</span>
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;