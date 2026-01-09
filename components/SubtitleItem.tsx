
import React, { useState } from 'react';
import { Subtitle } from '../types';
import { formatShortTime } from '../utils/timing';

interface SubtitleItemProps {
  subtitle: Subtitle;
  isActive: boolean;
  onSelect: (time: number) => void;
  onUpdate: (id: string, text: string) => void;
  onCopy: (text: string) => void;
}

const SubtitleItem: React.FC<SubtitleItemProps> = ({ subtitle, isActive, onSelect, onUpdate, onCopy }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(subtitle.text);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(subtitle.id, text);
  };

  return (
    <div 
      className={`group relative p-4 rounded-lg transition-all duration-200 border-l-4 
        ${isActive 
          ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
          : 'bg-slate-800/40 border-transparent hover:bg-slate-800/60'}`}
      onClick={() => !isEditing && onSelect(subtitle.start)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
          [{formatShortTime(subtitle.start)} – {formatShortTime(subtitle.end)}]
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCopy(subtitle.text);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded transition-all text-slate-400 hover:text-white"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </button>
      </div>

      {isEditing ? (
        <input 
          autoFocus
          className="w-full bg-slate-900 text-white p-1 rounded border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p 
          className={`text-sm leading-relaxed cursor-text transition-colors duration-200 ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {subtitle.text}
        </p>
      )}

      {/* Length Badge */}
      <div className={`mt-2 text-[10px] font-medium inline-block px-1.5 py-0.5 rounded
        ${subtitle.text.length > 30 ? 'bg-red-500/20 text-red-400' : 
          subtitle.text.length >= 18 && subtitle.text.length <= 26 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
        {subtitle.text.length} chars
      </div>
    </div>
  );
};

export default SubtitleItem;
