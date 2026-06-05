import { useCallback, useState, useEffect } from 'react';
import StepIndicator from './components/StepIndicator';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultsScreen from './components/ResultsScreen';
import ExportScreen from './components/ExportScreen';
import { DEFAULT_CLASS, DEFAULT_SUBJECT } from './data/mockData';

const BACKEND_URL = 'http://localhost:3001';

export default function App() {
  const [step, setStep] = useState(1);
  const [className, setClassName] = useState(DEFAULT_CLASS);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [csvText, setCsvText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async (content, clsName, subjName) => {
    try {
      setError(null);
      setIsDataReady(false);
      
      // 1. Upload CSV to backend
      const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: content })
      });

      if (!uploadRes.ok) {
        const errJson = await uploadRes.json();
        throw new Error(errJson.error || 'Failed to upload CSV data.');
      }

      // 2. Trigger Gemini Analysis
      const analyzeRes = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!analyzeRes.ok) {
        const errJson = await analyzeRes.json();
        throw new Error(errJson.error || 'Failed to analyze quiz data.');
      }

      const result = await analyzeRes.json();
      setAnalysisResult(result);
      setIsDataReady(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep(1); // send back to upload on error
    }
  };

  const handleAnalyze = useCallback((content, clsName, subjName) => {
    setClassName(clsName);
    setSubject(subjName);
    setCsvText(content);
    setStep(2);
    runAnalysis(content, clsName, subjName);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setStep(3);
  }, []);

  const handleStepClick = useCallback((targetStep) => {
    // Only allow clicking steps we have data for
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2 && csvText) {
      setStep(2);
    } else if (targetStep === 3 && analysisResult) {
      setStep(3);
    } else if (targetStep === 4 && analysisResult) {
      setStep(4);
    }
  }, [csvText, analysisResult]);

  const handleRegenerate = useCallback(() => {
    setStep(2);
    runAnalysis(csvText, className, subject);
  }, [csvText, className, subject]);

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator currentStep={step} onStepClick={handleStepClick} />

      {error && (
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {step === 1 && (
          <UploadScreen
            className={className}
            subject={subject}
            onClassNameChange={setClassName}
            onSubjectChange={setSubject}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 2 && (
          <LoadingScreen onComplete={handleLoadingComplete} isDataReady={isDataReady} />
        )}

        {step === 3 && (
          <ResultsScreen
            className={className}
            subject={subject}
            analysisResult={analysisResult}
            onEdit={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onApprove={() => setStep(4)}
            onRegenerate={handleRegenerate}
          />
        )}

        {step === 4 && (
          <ExportScreen
            className={className}
            subject={subject}
            analysisResult={analysisResult}
            onStartNew={() => {
              setAnalysisResult(null);
              setIsDataReady(false);
              setStep(1);
            }}
          />
        )}
      </main>

      <div className="h-4 sm:hidden" aria-hidden />
    </div>
  );
}
