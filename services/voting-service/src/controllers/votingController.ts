import { FastifyReply, FastifyRequest } from 'fastify';

import { VotingService } from '../services/votingService';

export class VotingController {
  constructor(private votingService: VotingService) {}

  getElections = async (
    request: FastifyRequest<{ Querystring: { status?: string; constituency?: string } }>,
    reply: FastifyReply
  ) => {
    const elections = await this.votingService.getElections(request.query.status, request.query.constituency);
    return reply.send({ success: true, count: elections.length, elections });
  };

  getElectionById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const election = await this.votingService.getElectionById(request.params.id);
    return reply.send({ success: true, election });
  };

  createElection = async (
    request: FastifyRequest<{
      Body: {
        title: string;
        constituency: string;
        start_time: string;
        end_time: string;
        status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
      };
    }>,
    reply: FastifyReply
  ) => {
    const election = await this.votingService.createElection(request.body);
    return reply.code(201).send({ success: true, election });
  };

  generateToken = async (
    request: FastifyRequest<{ Body: { voterId: string; electionId: string } }>,
    reply: FastifyReply
  ) => {
    const { voterId, electionId } = request.body;
    const tokenHash = await this.votingService.generateToken(voterId, electionId);
    return reply.send({ success: true, tokenHash });
  };

  vote = async (
    request: FastifyRequest<{ Body: { electionId: string; tokenHash: string; encryptedVote: string } }>,
    reply: FastifyReply
  ) => {
    const { electionId, tokenHash, encryptedVote } = request.body;
    const vote = await this.votingService.submitVote(electionId, tokenHash, encryptedVote);

    return reply.code(201).send({
      success: true,
      message: 'Vote successfully recorded',
      receipt: vote.id,
      txHash: vote.blockchain_tx_hash,
    });
  };

  updateElection = async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    const { id } = request.params;
    const election = await this.votingService.updateElection(id, request.body);
    return reply.send({ success: true, election });
  };

  deleteElection = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    await this.votingService.deleteElection(id);
    return reply.send({ success: true, message: 'Election deleted' });
  };
}
