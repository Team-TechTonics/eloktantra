import axios from 'axios';
import { FastifyInstance } from 'fastify';

import { config } from '@eloktantra/config';
import { badRequest, conflict, forbidden, internalError, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

const IDENTITY_URL = config.services.identity.url;
const LEDGER_URL = config.services.ledger.url;

const httpClient = axios.create({
  timeout: config.requestTimeoutMs,
});

export class VotingService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async getElections(status?: string, constituency?: string) {
    let query = this.supabase.from('elections').select('*').order('start_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (constituency) {
      query = query.eq('constituency', constituency);
    }

    const { data, error } = await query;

    if (error) throw badRequest(error.message);
    return data || [];
  }

  async getElectionById(id: string) {
    const { data, error } = await this.supabase.from('elections').select('*').eq('id', id).single();

    if (error || !data) throw notFound('Election not found');

    const { data: candidates, error: candidateError } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('constituency', data.constituency)
      .order('name', { ascending: true });

    if (candidateError) {
      throw badRequest(candidateError.message);
    }

    return { ...data, candidates: candidates || [] };
  }

  async createElection(electionData: {
    title: string;
    constituency: string;
    start_time: string;
    end_time: string;
    status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  }) {
    const startTime = new Date(electionData.start_time);
    const endTime = new Date(electionData.end_time);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw badRequest('start_time and end_time must be valid ISO timestamps');
    }

    if (startTime >= endTime) {
      throw badRequest('end_time must be greater than start_time');
    }

    const payload = {
      ...electionData,
      status: electionData.status || 'UPCOMING',
    };

    const { data, error } = await this.supabase.from('elections').insert([payload]).select().single();

    if (error || !data) throw badRequest(error?.message || 'Unable to create election');
    return data;
  }

  async generateToken(voterId: string, electionId: string) {
    try {
      const response = await httpClient.post(`${IDENTITY_URL}/generate-voting-token`, {
        voterId,
        electionId,
      });

      return response.data.tokenHash as string;
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Unable to generate token';
      throw badRequest(message);
    }
  }

  async submitVote(electionId: string, tokenHash: string, encryptedVote: string) {
    if (!electionId || !tokenHash || !encryptedVote) {
      throw badRequest('electionId, tokenHash and encryptedVote are required');
    }

    const election = await this.getElectionById(electionId);

    if (election.status !== 'ACTIVE') {
      throw forbidden('Election is not active');
    }

    const now = new Date();
    if (now < new Date(election.start_time) || now > new Date(election.end_time)) {
      throw forbidden('Election is outside active voting window');
    }

    const { data: tokenRecord, error: tokenError } = await this.supabase
      .from('voting_tokens')
      .update({ used: true, used_at: now.toISOString() })
      .eq('token_hash', tokenHash)
      .eq('election_id', electionId)
      .eq('used', false)
      .select('id, expires_at')
      .single();

    if (tokenError || !tokenRecord) {
      throw conflict('Invalid token, expired token, or token already used');
    }

    if (tokenRecord.expires_at && now > new Date(tokenRecord.expires_at)) {
      await this.supabase.from('voting_tokens').update({ used: false, used_at: null }).eq('id', tokenRecord.id);
      throw forbidden('Voting token has expired');
    }

    try {
      const ledgerResponse = await httpClient.post(`${LEDGER_URL}/record-vote`, {
        electionId,
        encryptedVote,
      });

      const txHash = ledgerResponse.data.txHash;
      if (!txHash) {
        throw internalError('Blockchain ledger did not return a transaction hash');
      }

      const { data: vote, error: voteError } = await this.supabase
        .from('votes')
        .insert([
          {
            election_id: electionId,
            token_id: tokenRecord.id,
            encrypted_vote: encryptedVote,
            blockchain_tx_hash: txHash,
          },
        ])
        .select()
        .single();

      if (voteError || !vote) {
        throw badRequest(voteError?.message || 'Unable to record vote');
      }

      return vote;
    } catch (error) {
      await this.supabase.from('voting_tokens').update({ used: false, used_at: null }).eq('id', tokenRecord.id);
      throw error;
    }
  }

  async updateElection(id: string, data: any) {
    const { data: election, error } = await this.supabase
      .from('elections')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !election) throw badRequest(error?.message || 'Unable to update election');
    return election;
  }

  async deleteElection(id: string) {
    const { error } = await this.supabase.from('elections').delete().eq('id', id);
    if (error) throw badRequest(error.message);
    return { success: true };
  }
}
