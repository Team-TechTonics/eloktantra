"use client";

import React from 'react';
import { useKioskVoting } from '@/hooks/useKioskVoting';
import KioskScanner from './KioskScanner';
import KioskFaceVerify from './KioskFaceVerify';
import KioskBallot from './KioskBallot';
import KioskConfirmVote from './KioskConfirmVote';
import KioskSuccess from './KioskSuccess';
import KioskVoterConfirmation from '@/components/kiosk/KioskVoterConfirmation';
import KioskFingerprintSim from '@/components/kiosk/KioskFingerprintSim';
import KioskStatusBar from '@/components/kiosk/KioskStatusBar';
import { useKioskSessionGuard } from '@/components/kiosk/KioskSessionGuard';
import { useKioskTamperDetection } from '@/components/kiosk/KioskTamperDetection';

/* ELECTION_ELIGIBILITY step logic */
function KioskElectionSelect({ onSelect, loading, error }: { onSelect: (id: string) => void, loading: boolean, error: string | null }) {
  const [elections, setElections] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    const fetchElections = async () => {
      try {
        const { apiClient } = await import('@/lib/api/client');
        const res = await apiClient.get('/elections');
        setElections(res.data.elections || res.data.data || res.data || []);
      } catch (err) {
        setElections([{ id: 'demo-election-01', _id: 'demo-election-01', title: 'Demo Constituency Election' }]);
      } finally {
        setFetching(false);
      }
    };
    fetchElections();
  }, []);

  if (fetching) return <div className="flex min-h-screen items-center justify-center"><div className="text-5xl text-blue-900 font-bold animate-pulse text-center">Loading Active Elections...</div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-gray-200 p-16 w-full max-w-4xl text-center">
        <h2 className="text-6xl font-black text-blue-900 mb-10 uppercase tracking-tight border-b-8 border-orange-500 pb-8">Select Election</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-8 rounded-xl mb-10 text-3xl font-bold border-4 border-red-300 shadow-inner">{error}</div>}

        <div className="flex flex-col space-y-8">
          {elections.map((elec) => (
            <button
              key={elec.id || elec._id}
              onClick={() => onSelect(elec.id || elec._id)}
              disabled={loading}
              className="w-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 focus:bg-orange-100 text-blue-900 font-extrabold text-4xl py-12 px-10 rounded-xl shadow-lg border-4 border-blue-200 transition-colors uppercase flex justify-between items-center"
            >
              <span className="text-left w-3/4 truncate">{elec.title || elec.name || 'General Election'}</span>
              <span className="text-orange-600 text-6xl">➔</span>
            </button>
          ))}
          {elections.length === 0 && (
             <div className="text-4xl text-red-600 font-black p-12 bg-red-50 rounded-xl border-4 border-red-200">NO ACTIVE ELECTIONS FOUND FOR YOUR CONSTITUENCY.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KioskContainer() {
  const {
    step,
    session,
    loading,
    error,
    handleScannerSubmit,
    handleFaceVerify,
    handleConfirmVoter,
    handleFingerprintComplete,
    handleElectionSelect,
    handleCandidateSelect,
    handleSubmitVote,
    resetSession,
    goBackToBallot,
    setError
  } = useKioskVoting();

  const handleTamper = () => {
    setError('SECURITY ALERT: Abnormal terminal activity detected. Session reset.');
    resetSession();
  };

  useKioskTamperDetection(handleTamper);
  useKioskSessionGuard(() => {
    setError('Session timed out due to inactivity.');
    resetSession();
  }, 60000);

  return (
    <div className="min-h-screen bg-gray-100 font-sans selection:bg-orange-200 relative pb-16">
      <div className="absolute top-0 w-full h-8 bg-blue-900 block" aria-hidden="true"></div>
      
      {error && step !== 'ELECTION_ELIGIBILITY' && (
        <div className="fixed top-8 left-0 right-0 z-[100] bg-red-600 text-white p-6 text-center text-3xl font-black shadow-2xl flex justify-center items-center space-x-10">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline hover:text-red-200 px-4 py-2 bg-red-800 rounded-lg">DISMISS</button>
        </div>
      )}

      {step === 'SCANNER' && (
        <KioskScanner onSubmit={handleScannerSubmit} loading={loading} />
      )}
      
      {step === 'FACE_VERIFY' && (
        <KioskFaceVerify onVerify={handleFaceVerify} loading={loading} />
      )}

      {step === 'CONFIRM_VOTER' && (
        <KioskVoterConfirmation 
          profile={session.voterProfile}
          electionId={session.electionId || 'General'}
          onConfirm={handleConfirmVoter!}
          onCancel={resetSession}
          loading={loading}
        />
      )}

      {step === 'FINGERPRINT' && (
        <KioskFingerprintSim onComplete={handleFingerprintComplete!} />
      )}

      {step === 'ELECTION_ELIGIBILITY' && (
        <KioskElectionSelect onSelect={handleElectionSelect} loading={loading} error={error} />
      )}

      {step === 'BALLOT' && (
        <KioskBallot 
          electionId={session.electionId} 
          constituencyId={session.voterProfile?.constituencyId || session.voterProfile?.constituency}
          onSelectCandidate={handleCandidateSelect}
        />
      )}

      {step === 'CONFIRM_VOTE' && session.candidateId && (
        <KioskConfirmVote 
          candidateId={session.candidateId} 
          onConfirm={handleSubmitVote} 
          onCancel={goBackToBallot} 
          loading={loading}
        />
      )}

      {step === 'SUCCESS' && (
        <KioskSuccess txHash={session.txHash} onReset={resetSession} />
      )}

      <KioskStatusBar status={step} />
    </div>
  );
}
