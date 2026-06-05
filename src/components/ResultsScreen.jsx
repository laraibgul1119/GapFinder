import GapCard from './GapCard';

export default function ResultsScreen({
  className,
  subject,
  analysisResult,
  onEdit,
  onApprove,
  onRegenerate,
}) {
  const gaps = analysisResult?.learningGaps || [];
  const totalAffected = analysisResult?.totalAffected || 0;
  const totalStudents = analysisResult?.totalStudents || 0;

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto pb-28">
      <div className="rounded-2xl bg-navy text-white p-5 sm:p-6 shadow-elevated mb-6">
        <p className="text-amber-accent text-sm font-medium uppercase tracking-wide mb-1">
          Analysis Complete
        </p>
        <h2 className="text-xl sm:text-2xl font-bold">
          {className} {subject}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base text-slate-600 mb-8 px-1">
        <span className="font-semibold text-navy">{gaps.length} learning gaps found</span>
        <span className="text-slate-300" aria-hidden>•</span>
        <span>
          <strong className="text-navy">{totalAffected}/{totalStudents}</strong> students affected
        </span>
        <span className="text-slate-300" aria-hidden>•</span>
        <span className="text-emerald-700 font-medium">Ready for review</span>
      </div>

      <div className="space-y-6">
        {gaps.map((gap, i) => (
          <GapCard key={gap.id || i} gap={gap} index={i} />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-xl border-2 border-navy/20 text-navy font-semibold py-3 px-4 hover:bg-navy/5 transition-colors"
          >
            ✏️ Edit Plan
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-xl bg-amber-accent hover:bg-amber-light text-navy-dark font-semibold py-3 px-4 shadow-md transition-colors"
          >
            ✅ Approve & Export
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            className="flex-1 rounded-xl border border-slate-200 text-slate-700 font-semibold py-3 px-4 hover:bg-slate-50 transition-colors"
          >
            🔄 Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
