import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AddMemberModal({ open, onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(email);
    setLoading(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative border-4 border-[#28b4b4]">
        <h2 className="text-xl font-bold mb-4 text-center">Add Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Member Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="border border-[#28b4b4] text-[#28b4b4]">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#28b4b4] hover:bg-[#239e9e] text-white">
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
