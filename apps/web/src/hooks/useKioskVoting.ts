import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

export type KioskStep = 
  | 'SCANNER'
  | 'FACE_VERIFY'
  | 'CONFIRM_VOTER'
  | 'FINGERPRINT'
  | 'ELECTION_ELIGIBILITY'
  | 'BALLOT'
  | 'CONFIRM_VOTE'
  | 'SUCCESS';

import { getKioskDeviceId } from '@/components/kiosk/KioskDeviceBinding';
import { KioskOfflineQueue } from '@/components/kiosk/KioskOfflineQueue';

export interface KioskSession {
  voterProfile?: any;
  electionId?: string;
  token?: string;
  candidateId?: string;
  txHash?: string;
}

export const useKioskVoting = () => {
  const [step, setStep] = useState<KioskStep>('SCANNER');
  const [session, setSession] = useState<KioskSession>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetSession = () => {
    setSession({});
    setStep('SCANNER');
    setError(null);
  };

  const goBackToBallot = () => {
    setSession(prev => ({ ...prev, candidateId: undefined }));
    setStep('BALLOT');
    setError(null);
  };

  const handleScannerSubmit = async (phone: string, voterId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Trying the digilocker-verify route
      const res = await apiClient.post('/digilocker/verify', { phone, voterId, identifier: phone || voterId });
      
      const user = res.data.user || res.data;
      setSession(prev => ({ ...prev, voterProfile: user }));
      setStep('FACE_VERIFY');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { voterId: session.voterProfile?.id || session.voterProfile?.voterId || session.voterProfile?._id };
      const res = await apiClient.post('/verify/face', payload);

      if (res.data.match) {
        setStep('CONFIRM_VOTER');
      } else {
        setError('Face verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Face verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVoter = () => {
    setStep('FINGERPRINT');
  };

  const handleFingerprintComplete = () => {
    setStep('ELECTION_ELIGIBILITY');
  };

  const handleElectionSelect = async (electionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { 
          voterId: session.voterProfile?.id || session.voterProfile?.voterId || session.voterProfile?._id, 
          electionId 
      };
      
      const res = await apiClient.post('/generate-token', payload);

      setSession(prev => ({ ...prev, electionId, token: res.data.token || res.data.tokenHash }));
      setStep('BALLOT');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Token generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    setSession(prev => ({ ...prev, candidateId }));
    setStep('CONFIRM_VOTE');
  };

  const handleSubmitVote = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        candidateId: session.candidateId,
        electionId: session.electionId,
        token: session.token,
        tokenHash: session.token,
        deviceId: getKioskDeviceId(),
        constituencyId: session.voterProfile?.constituencyId || session.voterProfile?.constituency,
        userId: session.voterProfile?.id || session.voterProfile?._id
      };
      
      // Using custom authorization header for strict mode APIs if necessary, 
      // but apiClient intercepts and adds local storage token. Here we ensure it works.
      let res;
      try {
        res = await apiClient.post('/vote/submit', payload, {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });
      } catch (err: any) {
         if (!navigator.onLine || (err.message && err.message.toLowerCase().includes('network'))) {
            // Offline queue fallback
            KioskOfflineQueue.addVote(payload);
            setSession(prev => ({ ...prev, txHash: 'QUEUED-OFFLINE-' + crypto.randomUUID() }));
            setStep('SUCCESS');
            return;
         }
         throw err;
      }

      setSession(prev => ({ ...prev, txHash: res.data.txHash || '0x' + Math.random().toString(16).slice(2) }));
      localStorage.setItem('kiosk_last_vote_time', Date.now().toString());
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Vote submission failed');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
