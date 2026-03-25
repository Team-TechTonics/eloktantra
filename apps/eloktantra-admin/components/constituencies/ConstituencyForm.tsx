'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Loader2, Vote } from 'lucide-react';
import { adminCreateConstituency, adminGetElections } from '@/lib/api';
import { useEffect, useState } from 'react';

const constituencySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  state: z.string().min(1, 'State is required'),
  electionId: z.string().min(1, 'Please link this to an active Election cycle'),
  constituency_number: z.number().optional().or(z.literal(0)),
  type: z.enum(['General', 'SC', 'ST']).default('General'),
  total_voters: z.number().optional().or(z.literal(0)),
});

type ConstituencyFormValues = z.infer<typeof constituencySchema>;

interface ConstituencyFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export default function ConstituencyForm({ onSuccess, initialData }: ConstituencyFormProps) {
  const [elections, setElections] = useState<any[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ConstituencyFormValues>({
    resolver: zodResolver(constituencySchema),
    defaultValues: initialData || {
      name: '',
      state: '',
      electionId: '',
      type: 'General',
      constituency_number: 0,
      total_voters: 0,
    }
  });

  useEffect(() => {
    const fetchElections = async () => {
        try {
            const res = await adminGetElections();
            setElections(Array.isArray(res.data) ? res.data : (res.data.elections || res.data.data || []));
        } catch (err) {
            console.error('Failed to bridge elections');
        }
    };
    fetchElections();
  }, []);

  const onSubmit = async (values: ConstituencyFormValues) => {
    try {
      if (initialData?.id || initialData?._id) {
        await adminCreateConstituency({ ...values, id: initialData.id || initialData._id });
        toast.success('Constituency updated');
      } else {
        await adminCreateConstituency(values);
        toast.success('Constituency added successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save constituency');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Constituency Name</label>
        <input 
          {...register('name')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. Varanasi"
        />
        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Vote className="w-3 h-3 text-amber-500" /> Parent Election Cycle
        </label>
        <select 
          {...register('electionId')}
          className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-sm"
        >
            <option value="">Select Target Election</option>
            {elections.map(el => <option key={el.id || el._id} value={el.id || el._id}>{el.title}</option>)}
        </select>
        {errors.electionId && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.electionId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / UT</label>
        <input 
          {...register('state')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. Uttar Pradesh"
        />
        {errors.state && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.state.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Number</label>
          <input 
            type="number"
            {...register('constituency_number', { valueAsNumber: true })}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reservation Type</label>
          <select 
            {...register('type')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm uppercase tracking-widest"
          >
            <option value="General">General</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Eligible Voters (Approx)</label>
        <input 
          type="number"
          {...register('total_voters', { valueAsNumber: true })}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Boundary</>}
      </button>
    </form>
  );
}
