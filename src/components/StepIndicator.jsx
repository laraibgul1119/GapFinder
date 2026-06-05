const STEPS = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Analyze' },
  { num: 3, label: 'Results' },
  { num: 4, label: 'Export' },
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <nav
      className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-50"
      aria-label="Progress"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <ol className="flex items-center justify-center gap-1 sm:gap-2">
          {STEPS.map((step, i) => {
            const isActive = currentStep === step.num;
            const isComplete = currentStep > step.num;
            return (
              <li key={step.num} className="flex items-center">
                {i > 0 && (
                  <span
                    className={`hidden sm:block w-8 lg:w-12 h-0.5 mx-1 rounded ${
                      isComplete ? 'bg-amber-accent' : 'bg-slate-200'
                    }`}
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.num)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-navy bg-navy/5'
                      : isComplete
                        ? 'text-navy/80 hover:bg-slate-50'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-navy text-white'
                        : isComplete
                          ? 'bg-amber-accent text-navy-dark'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </span>
                  <span className="hidden min-[380px]:inline">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
