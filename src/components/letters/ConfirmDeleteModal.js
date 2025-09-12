import { Button } from '@/components/ui/button';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, bureauName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border-4 border-red-500">
        <h2 className="text-xl font-bold mb-4 text-center text-red-600">Delete Bureau</h2>
        <p className="mb-6 text-center text-gray-700">
          Are you sure you want to delete the bureau <span className="font-semibold">{bureauName}</span>?<br />
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
