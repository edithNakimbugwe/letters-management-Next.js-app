'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6">
          <div className="max-w-2xl space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Email notifications for new letters
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Desktop notifications
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                type="button"
                className="bg-[#28b4b4] text-white px-4 py-2 rounded-lg hover:bg-[#229999] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
