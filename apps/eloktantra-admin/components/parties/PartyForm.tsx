'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminCreateParty } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional().or(z.literal('')),
  ideology: z.string().optional(),
  founded_year: z.coerce.number().optional(),
  headquarters: z.string().optional(),
  president: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type PartyFormValues = z.infer<typeof partySchema>;

interface PartyFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export default function PartyForm({ onSuccess, initialData }: PartyFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: initialData || {
      name: '',
      abbreviation: '',
      color: '#000000',
    }
  });

  const onSubmit = async (values: PartyFormValues) => {
    try {
      // Unified Remote Command (Port 3000)
      await adminCreateParty({
        ...values,
        id: initialData?._id
      });
      toast.success(initialData ? 'Party updated' : 'Party registered successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save party');
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Party Name</label>
        <input 
          {...register('name')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. Bharatiya Janata Party"
        />
        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Abbreviation</label>
          <input 
            {...register('abbreviation')}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-black text-sm uppercase"
            placeholder="e.g. BJP"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme Color</label>
          <div className="flex space-x-2">
            <input 
              type="color"
              {...register('color')}
              className="w-12 h-11 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer p-1"
            />
            <input 
              {...register('color')}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-mono text-xs text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo URL</label>
        <input 
          {...register('logo_url')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Ideology</label>
        <input 
          {...register('ideology')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. Conservatism, Socialism"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Register Party</>}
      </button>
    </form>
  );
}
