'use client';

export default function AddLetterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Letter</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Enter letter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Sender's name or department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Recipient's name or department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Contact number or email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
              >
                <option value="">Select urgency level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              rows={6}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
              placeholder="Enter letter content"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#28b4b4] text-white px-4 py-2 rounded-lg hover:bg-[#229999] transition-colors"
            >
              Add Letter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
