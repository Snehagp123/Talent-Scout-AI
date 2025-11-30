import React, { useState } from 'react';
import { AppState, JobConfig, Message, FinalReport } from './types';
import { SetupForm } from './components/SetupForm';
import { ChatInterface } from './components/ChatInterface';
import { ReportView } from './components/ReportView';
import { startInterviewSession, generateFinalReport } from './services/geminiService';
import { BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [config, setConfig] = useState<JobConfig | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [report, setReport] = useState<FinalReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleSetupComplete = async (jobConfig: JobConfig) => {
    setConfig(jobConfig);
    try {
      const intro = await startInterviewSession(jobConfig);
      setInitialMessage(intro || "Hello! I'm ready to interview you.");
      setAppState(AppState.INTERVIEW);
    } catch (error) {
      console.error("Failed to start session", error);
      alert("Error starting AI session. Please check your API key.");
    }
  };

  const handleEndInterview = async (messages: Message[]) => {
    if (!config) return;
    
    setIsGeneratingReport(true);
    // Convert messages to a transcript format
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    
    try {
      const finalReport = await generateFinalReport(transcript, config);
      setReport(finalReport);
      setAppState(AppState.REPORT);
    } catch (error) {
      console.error("Failed to generate report", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRestart = () => {
    setAppState(AppState.SETUP);
    setConfig(null);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <BrainCircuit size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">TalentScout AI</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
             <span className={`${appState === AppState.SETUP ? 'text-indigo-600' : ''}`}>1. Setup</span>
             <span className="text-slate-300">/</span>
             <span className={`${appState === AppState.INTERVIEW ? 'text-indigo-600' : ''}`}>2. Interview</span>
             <span className="text-slate-300">/</span>
             <span className={`${appState === AppState.REPORT ? 'text-indigo-600' : ''}`}>3. Analysis</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay for Report Generation */}
        {isGeneratingReport && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-slate-800">Analyzing Interview Performance...</h3>
                <p className="text-slate-500">TalentScout is generating your detailed scorecard.</p>
            </div>
        )}

        {appState === AppState.SETUP && (
            <div className="animate-fade-in-up">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">AI-Powered Candidate Screening</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Conduct depth-first technical interviews automatically. Configure the role, 
                        let the AI interview the candidate, and get instant, data-driven hiring recommendations.
                    </p>
                </div>
                <SetupForm onComplete={handleSetupComplete} />
            </div>
        )}

        {appState === AppState.INTERVIEW && config && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-2">
                     <ChatInterface 
                        initialMessage={initialMessage} 
                        config={config} 
                        onEndInterview={handleEndInterview} 
                     />
                </div>
                <div className="hidden lg:block space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full">
                        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Target Competencies</h3>
                        <div className="space-y-3">
                            {config.topics.map((topic, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                    <span className="text-sm font-medium text-slate-700">{topic}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm leading-relaxed">
                            <p className="font-semibold mb-1">💡 Interview Tip:</p>
                             The AI is instructed to probe deeper if answers are vague. Encouraging specific examples usually yields better scores.
                        </div>
                    </div>
                </div>
            </div>
        )}

        {appState === AppState.REPORT && report && (
            <ReportView report={report} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
};

export default App;