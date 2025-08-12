'use client';

export default function LettersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Letters</h1>
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search letters..."
              className="px-4 py-2 border rounded-lg w-64"
            />
            <button className="bg-[#28b4b4] text-white px-4 py-2 rounded-lg hover:bg-[#229999] transition-colors">
              New Letter
            </button>
          </div>
          {/* Add your letters table or grid here */}
          <div className="text-gray-500 text-center py-8">No letters found</div>
        </div>
      </div>
    </div>
  );
}
