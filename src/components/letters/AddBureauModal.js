import { useState } from 'react';
import { addBureau } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AddBureauModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const membersArray = members.split(',').map((email) => email.trim()).filter(Boolean);
    await addBureau({
      name,
      members: membersArray,
      addedBy: user?.email || 'unknown',
    });
    setLoading(false);
    setName('');
    setMembers('');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative border-4 border-[#28b4b4]">
        <h2 className="text-xl font-bold mb-4 text-center">Add Bureau</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Bureau Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Members (comma-separated emails)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#28b4b4] hover:bg-[#239e9e] text-white">
              {loading ? 'Adding...' : 'Add Bureau'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
