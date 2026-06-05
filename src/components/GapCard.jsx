import { useState } from 'react';

const TABS = [
  { key: 'struggling', label: 'Struggling' },
  { key: 'onTrack', label: 'On-Track' },
  { key: 'advanced', label: 'Advanced' },
];

export default function GapCard({ gap, index }) {
  const [activeTab, setActiveTab] = useState('struggling');
  const activity = gap.activities[activeTab];

  return (
    <article
      className="rounded-2xl bg-white border border-slate-100 shadow-card overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-navy pr-2">
            {gap.title}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            {gap.strugglingCount}/{gap.totalStudents} students struggling
          </span>
        </div>
        <p className="mt-3 text-slate-600 italic text-sm sm:text-base leading-relaxed">
          &ldquo;{gap.misconception}&rdquo;
        </p>
      </div>

      <div className="px-5 sm:px-6 pt-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 pt-4" role="tabpanel">
        <h4 className="font-semibold text-navy mb-3">{activity.title}</h4>
        <ul className="space-y-2.5">
          {activity.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
              <span className="text-amber-accent font-bold shrink-0">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
