import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NewsCardProps } from '../services/api';

const NewsCard: React.FC<NewsCardProps & { id?: number }> = ({ id, category, title, date, img, desc }) => {
  const navigate = useNavigate();
  return (
    <div className="group cursor-pointer" onClick={() => id && navigate(`/news/${id}`)}>
      <div className="h-80 overflow-hidden mb-6 relative rounded-sm bg-[#F5F5F5]">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
        />
        <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 text-[10px] font-black uppercase">{date}</div>
      </div>
      <div className="text-left">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-3">{category}</p>
        <h3 className="text-lg font-black uppercase mb-3 leading-tight group-hover:underline transition-all">{title}</h3>
        <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2 mb-5 uppercase opacity-80">{desc}</p>
        <button className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/btn hover:text-gray-400">
          Đọc thêm <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
