import { usePdfProcessor } from './features/pdf-processor/hooks/usePdfProcessor';
import { UploadZone } from './features/pdf-processor/components/UploadZone';
import { ProgressTracker } from './features/pdf-processor/components/ProgressTracker';
import { ResultsView } from './features/pdf-processor/components/ResultsView';
import { DashboardLayout } from './features/pdf-processor/components/DashboardLayout';
import './App.css';

function App() {
  const { uploadPdf, status, isLoading, error } = usePdfProcessor();

  const handleFileSelected = (file: File) => {
    uploadPdf(file);
  };

  const isProcessing = isLoading || (status?.status !== 'completed' && status?.status !== 'failed' && !!status);
  const showResults = !!status && (status.status === 'completed' || isProcessing);
  const currentStatus = status?.status || 'idle';
  const hasResult = !!status?.result;

  return (
    <DashboardLayout
      controlPanel={
        <>
          <UploadZone
            onFileSelected={handleFileSelected}
            disabled={isProcessing}
            resetTrigger={!isProcessing && !status}
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
              ⚠ {error}
            </div>
          )}

          {(isProcessing || hasResult) && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-t border-slate-800 pt-6">
                Processing Status
              </h3>
              <ProgressTracker status={currentStatus} />
            </div>
          )}
        </>
      }
      resultsView={
        <ResultsView
          toc={status?.result}
          isLoading={isProcessing}
          isEmpty={!showResults}
        />
      }
    />
  );
}

export default App;
