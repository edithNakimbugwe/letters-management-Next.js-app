"use client";
import { useEffect, useState } from 'react';
import { getBureaus } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import AddBureauModal from './AddBureauModal';
import AddMemberModal from './AddMemberModal';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import RemoveMembersModal from './RemoveMembersModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { db } from '@/firebase-config/firebase';

export default function BureausList() {
  const [bureaus, setBureaus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState(null);
  const [removeMembersModalOpen, setRemoveMembersModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bureauToDelete, setBureauToDelete] = useState(null);

  useEffect(() => {
    async function fetchBureaus() {
      const data = await getBureaus();
      setBureaus(data);
    }
    fetchBureaus();
  }, [modalOpen, memberModalOpen]);

  // Add member to bureau
  const handleAddMember = async (email) => {
    if (!selectedBureau) return;
    const bureauRef = doc(db, 'bureaus', selectedBureau.id);
    const updatedMembers = [...(selectedBureau.members || []), email];
    await updateDoc(bureauRef, { members: updatedMembers });
    setSelectedBureau(null);
    setMemberModalOpen(false);
  };


  // Remove members from bureau (bulk)
  const handleRemoveMembers = async (emails) => {
    if (!selectedBureau) return;
    const bureauRef = doc(db, 'bureaus', selectedBureau.id);
    const updatedMembers = (selectedBureau.members || []).filter(m => !emails.includes(m));
    await updateDoc(bureauRef, { members: updatedMembers });
    setBureaus(prev => prev.map(b => b.id === selectedBureau.id ? { ...b, members: updatedMembers } : b));
    setRemoveMembersModalOpen(false);
    setSelectedBureau(null);
  };

  // Delete bureau (with confirmation)
  const handleDeleteBureau = async () => {
    if (!bureauToDelete) return;
    await deleteDoc(doc(db, 'bureaus', bureauToDelete.id));
    setBureaus(prev => prev.filter(b => b.id !== bureauToDelete.id));
    setDeleteModalOpen(false);
    setBureauToDelete(null);
  };

  return (
    <div>
      <Button className="mb-4 bg-[#28b4b4] hover:bg-[#239e9e] text-white" onClick={() => setModalOpen(true)}>
        Add Bureau
      </Button>
      <AddBureauModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AddMemberModal
        open={memberModalOpen}
        onClose={() => { setMemberModalOpen(false); setSelectedBureau(null); }}
        onAdd={handleAddMember}
      />
      <div className="space-y-4">
        {bureaus.length === 0 ? (
          <div>No bureaus found.</div>
        ) : (
          bureaus.map((bureau) => (
            <div key={bureau.id} className="border rounded p-4">
              <div className="font-semibold flex items-center justify-between">
                <span>{bureau.name}</span>
                <div className="flex gap-2">
                  <Button
                    className="bg-[#28b4b4] hover:bg-[#239e9e] text-white px-3 py-1 text-xs"
                    onClick={() => { setSelectedBureau(bureau); setMemberModalOpen(true); }}
                  >
                    Add Member
                  </Button>
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs"
                    onClick={() => { setSelectedBureau(bureau); setRemoveMembersModalOpen(true); }}
                  >
                    Remove Members
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                    onClick={() => { setBureauToDelete(bureau); setDeleteModalOpen(true); }}
                  >
                    Delete Bureau
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">Added by: {bureau.addedBy}</div>
              <div className="mt-2">
                <span className="font-medium">Members:</span>
                <ul className="list-disc ml-6">
                  {bureau.members.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              </div>
      <RemoveMembersModal
        open={removeMembersModalOpen}
        onClose={() => { setRemoveMembersModalOpen(false); setSelectedBureau(null); }}
        members={selectedBureau?.members || []}
        onRemove={handleRemoveMembers}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setBureauToDelete(null); }}
        onConfirm={handleDeleteBureau}
        bureauName={bureauToDelete?.name || ''}
      />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
