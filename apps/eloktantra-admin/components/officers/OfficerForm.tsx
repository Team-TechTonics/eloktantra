'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import backendAPI from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Loader2, Shield } from 'lucide-react';

const officerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'), // Added
  booth_id: z.string().min(1, 'Booth ID is required'),
  device_id: z.string().min(1, 'Device ID is required'),
  status: z.enum(['Online', 'Offline']).default('Offline'),
});

type OfficerFormValues = z.infer<typeof officerSchema>;

interface OfficerFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export default function OfficerForm({ onSuccess, initialData }: OfficerFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OfficerFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: initialData || {
      name: '',
      username: '', // Added
      booth_id: '',
      device_id: '',
      status: 'Offline',
    }
  });

  const onSubmit = async (values: OfficerFormValues) => {
    try {
      if (initialData?._id || initialData?.id) {
        await backendAPI.put(`/api/admin/officer?id=${initialData._id || initialData.id}`, values);
        toast.success('Officer updated');
      } else {
        await backendAPI.post('/api/admin/officer', values);
        toast.success('Officer onboarded successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to save officer data');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center space-x-3 border border-blue-100 mb-6">
        <Shield className="w-5 h-5 text-blue-500" />
        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight">Access Control Layer</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Officer Full Name</label>
        <input 
          {...register('name')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. Rajesh Kumar"
        />
        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Officer Username</label>
        <input 
          {...register('username')}
          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-sm"
          placeholder="e.g. rajesh_booth101"
        />
        {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.username.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Booth</label>
          <input 
            {...register('booth_id')}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm uppercase"
            placeholder="e.g. B-102"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorized Device ID</label>
          <input 
            {...register('device_id')}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-mono text-xs text-gray-500 uppercase"
            placeholder="e.g. MAC-A1B2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Status</label>
        <select 
          {...register('status')}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-[10px] uppercase tracking-widest"
        >
          <option value="Offline">Offline</option>
          <option value="Online">Online</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Onboard Officer</>}
      </button>
    </form>
  );
}
