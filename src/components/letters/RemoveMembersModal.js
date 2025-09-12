import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function RemoveMembersModal({ open, onClose, members = [], onRemove }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleToggle = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(selected);
    setLoading(false);
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border-4 border-[#28b4b4]">
        <h2 className="text-xl font-bold mb-4 text-center">Remove Members</h2>
        <div className="mb-4">
          {members.length === 0 ? (
            <div className="text-gray-500">No members to remove.</div>
          ) : (
            <ul className="space-y-2">
              {members.map((email) => (
                <li key={email} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(email)}
                    onChange={() => handleToggle(email)}
                    className="accent-[#28b4b4]"
                  />
                  <span>{email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleRemove} disabled={loading || selected.length === 0}>
            {loading ? 'Removing...' : 'Remove Selected'}
          </Button>
        </div>
      </div>
    </div>
  );
}
