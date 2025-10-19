import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProposalForm from './components/ProposalForm';
import ProposalDisplay from './components/ProposalDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import { generateProposal } from './services/geminiService';
import type { FormState, ProposalData } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);

  const handleGenerateProposal = async (formData: FormState) => {
    setIsLoading(true);
    setError(null);
    setProposal(null);
    try {
      const generatedProposal = await generateProposal(formData);
      setProposal(generatedProposal);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred. Please check the console for more details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                  Create Your Perfect Proposal
              </h2>
              <p className="text-lg text-slate-600">
                  Fill in the details below, and let our AI assistant craft a professional proposal for you.
              </p>
          </div>

          <ProposalForm onSubmit={handleGenerateProposal} isLoading={isLoading} />

          {isLoading && (
             <div className="mt-8 text-center">
                <div className="inline-flex items-center bg-white p-4 rounded-lg shadow">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium text-slate-700">Generating your proposal... This may take a moment.</span>
                </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="mt-8">
              <ErrorDisplay message={error} />
            </div>
          )}

          {proposal && !isLoading && (
            <div className="mt-8">
              <ProposalDisplay proposal={proposal} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
