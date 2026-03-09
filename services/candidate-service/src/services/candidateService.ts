import { FastifyInstance } from 'fastify';
import '../plugins/supabase'; // Import for module augmentation

export class CandidateService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async getAllCandidates() {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async getCandidateById(id: string) {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getCandidatesByConstituency(constituencyId: string) {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('constituency', constituencyId);

    if (error) throw new Error(error.message);
    return data;
  }

  async createCandidate(candidateData: any) {
    const { data, error } = await this.supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateCandidate(id: string, candidateData: any) {
    const { data, error } = await this.supabase
      .from('candidates')
      .update(candidateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async searchCandidates(query: string) {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .or(`name.ilike.%${query}%,party.ilike.%${query}%,constituency.ilike.%${query}%`);

    if (error) throw new Error(error.message);
    return data;
  }
}
