import { useCallback, useState } from 'react';
import { SAMPLE_CSV } from '../data/mockData';

export default function UploadScreen({
  className,
  subject,
  onClassNameChange,
  onSubjectChange,
  onAnalyze,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('quiz_responses_class9b.csv');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvContent(e.target?.result || '');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto w-full">
      <header className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
          GapFinder <span aria-hidden>🎓</span>
        </h1>
        <p className="mt-2 text-slate-600 text-lg">
          Find learning gaps in 90 seconds
        </p>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          dragOver
            ? 'border-amber-accent bg-amber-accent/5 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-navy/40'
        } shadow-card`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload CSV file"
        />
        <div className="pointer-events-none">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-navy/10 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-navy font-semibold text-lg">
            Drag & drop your quiz CSV here
          </p>
          <p className="mt-1 text-slate-500 text-sm">or click to browse files</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {fileName}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setPasteOpen(!pasteOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-navy/80 hover:text-navy py-2"
        >
          <span>Or paste CSV data</span>
          <svg
            className={`w-5 h-5 transition-transform ${pasteOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {pasteOpen && (
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            placeholder="student_id,question_id,response,correct..."
          />
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Class Name</span>
          <input
            type="text"
            value={className}
            onChange={(e) => onClassNameChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            placeholder="e.g. Class 9B"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            placeholder="e.g. Biology"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => onAnalyze(csvContent, className, subject)}
        className="mt-8 w-full rounded-xl bg-navy hover:bg-navy-light text-white font-semibold text-lg py-4 px-6 shadow-elevated transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
      >
        Find Learning Gaps
        <span aria-hidden>→</span>
      </button>

      <footer className="mt-10 text-center text-xs text-slate-400">
        Powered by Elasticsearch + Gemini 3 Flash
      </footer>
    </div>
  );
}
