import { useCallback, useState } from 'react';
import StepIndicator from './components/StepIndicator';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultsScreen from './components/ResultsScreen';
import ExportScreen from './components/ExportScreen';
import { DEFAULT_CLASS, DEFAULT_SUBJECT } from './data/mockData';

export default function App() {
  const [step, setStep] = useState(1);
  const [className, setClassName] = useState(DEFAULT_CLASS);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);

  const handleAnalyze = useCallback(() => {
    setStep(2);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setStep(3);
  }, []);

  const handleStepClick = useCallback((targetStep) => {
    setStep(targetStep);
  }, []);

  const handleRegenerate = useCallback(() => {
    setStep(2);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator currentStep={step} onStepClick={handleStepClick} />

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
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}

        {step === 3 && (
          <ResultsScreen
            className={className}
            subject={subject}
            onEdit={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onApprove={() => setStep(4)}
            onRegenerate={handleRegenerate}
          />
        )}

        {step === 4 && (
          <ExportScreen
            className={className}
            subject={subject}
            onStartNew={() => setStep(1)}
          />
        )}
      </main>

      <div className="h-4 sm:hidden" aria-hidden />
    </div>
  );
}
