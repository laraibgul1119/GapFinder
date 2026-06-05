import { useEffect, useState } from 'react';
import { LOADING_STEPS } from '../data/mockData';

const STEP_DURATION_MS = 2800;

export default function LoadingScreen({ onComplete, isDataReady }) {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(1);

  useEffect(() => {
    if (visibleSteps < LOADING_STEPS.length) {
      const t = setTimeout(() => setVisibleSteps((v) => v + 1), STEP_DURATION_MS * 0.85);
      return () => clearTimeout(t);
    }
  }, [visibleSteps]);

  useEffect(() => {
    if (completedSteps < LOADING_STEPS.length) {
      const t = setTimeout(() => {
        setCompletedSteps((c) => c + 1);
      }, STEP_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (isDataReady) {
      const done = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(done);
    }
  }, [completedSteps, onComplete, isDataReady]);

  const progressPercent = Math.min(
    100,
    ((completedSteps + (completedSteps < LOADING_STEPS.length ? 0.3 : 0)) /
      LOADING_STEPS.length) *
      100
  );

  return (
    <div className="animate-fade-in max-w-lg mx-auto w-full text-center py-8 sm:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/5 text-navy text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-accent" />
          </span>
          Analyzing your class data
        </div>

        <div className="h-3 rounded-full bg-slate-200 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-navy to-amber-accent transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {Math.round(progressPercent)}% complete
        </p>
      </div>

      <ul className="space-y-4 text-left">
        {LOADING_STEPS.map((message, i) => {
          const isVisible = i < visibleSteps;
          const isComplete = i < completedSteps;
          if (!isVisible) return null;

          return (
            <li
              key={message}
              className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-card animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 transition-colors ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm sm:text-base ${
                  isComplete ? 'text-slate-700' : 'text-slate-600'
                }`}
              >
                {message}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
