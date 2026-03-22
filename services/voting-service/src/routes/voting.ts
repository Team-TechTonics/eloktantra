import { FastifyInstance } from 'fastify';

import { VotingController } from '../controllers/votingController';
import { VotingService } from '../services/votingService';

export default async function electionRoutes(fastify: FastifyInstance) {
  const votingService = new VotingService(fastify);
  const votingController = new VotingController(votingService);

  fastify.get('/elections', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'] },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
        },
      },
    },
  }, votingController.getElections);

  fastify.get('/elections/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 3 },
        },
      },
    },
  }, votingController.getElectionById);

  fastify.post('/elections', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'constituency', 'start_time', 'end_time'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 160 },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'] },
        },
      },
    },
  }, votingController.createElection);

  fastify.post('/generate-token', {
    schema: {
      body: {
        type: 'object',
        required: ['voterId', 'electionId'],
        properties: {
          voterId: { type: 'string', minLength: 3 },
          electionId: { type: 'string', minLength: 3 },
        },
      },
    },
  }, votingController.generateToken);

  fastify.post('/vote', {
    schema: {
      body: {
        type: 'object',
        required: ['electionId', 'tokenHash', 'encryptedVote'],
        properties: {
          electionId: { type: 'string', minLength: 3 },
          tokenHash: { type: 'string', minLength: 16 },
          encryptedVote: { type: 'string', minLength: 16, maxLength: 10_000 },
        },
      },
    },
  }, votingController.vote);

  fastify.patch('/elections/:id', votingController.updateElection);
  fastify.delete('/elections/:id', votingController.deleteElection);
}
