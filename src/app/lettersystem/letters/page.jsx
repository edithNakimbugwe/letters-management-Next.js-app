'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpDown, Pencil, Search, Trash2, Plus } from 'lucide-react';

const initialLetters = [
  { date: '2025-08-12', title: 'Annual Leave Application - Sarah Johnson', from: 'HR Department', to: 'Department Manager', contact: 'hr@company.com', urgency: 'medium' },
  { date: '2025-08-11', title: 'Equipment Procurement Request - IT Department', from: 'IT Manager', to: 'Finance Department', contact: '+256 700 123 456', urgency: 'high' },
  { date: '2025-08-10', title: 'Client Complaint - Service Quality Issue', from: 'Customer Service', to: 'Operations Manager', contact: 'customerservice@company.com', urgency: 'low' },
  { date: '2025-08-09', title: 'Contract Renewal Request - Vendor ABC Ltd', from: 'Procurement Office', to: 'Legal Department', contact: 'procurement@company.com', urgency: 'medium' },
  { date: '2025-08-08', title: 'Board Meeting Invitation - Q4 Review', from: 'Executive Office', to: 'All Department Heads', contact: 'executive@company.com', urgency: 'low' },
  { date: '2025-08-07', title: 'Urgent System Maintenance - Server Downtime', from: 'IT Support', to: 'Management', contact: '+256 701 987 654', urgency: 'urgent' },
];

export default function LettersPage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('asc');

  const filteredAndSortedLetters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = initialLetters.filter((row) => {
      if (!normalizedQuery) return true;
      return [row.date, row.title, row.from, row.to, row.contact, row.urgency]
        .some((v) => String(v).toLowerCase().includes(normalizedQuery));
    });
    const sorted = [...filtered].sort((a, b) => {
      // For date, sort by actual date value
      if (sortBy === 'date') {
        const aDate = new Date(a.date || 0).getTime();
        const bDate = new Date(b.date || 0).getTime();
        if (aDate < bDate) return sortDir === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
      const aVal = String(a[sortBy] ?? '').toLowerCase();
      const bVal = String(b[sortBy] ?? '').toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [query, sortBy, sortDir]);

  const toggleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Letters</h1>
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent"
              />
            </div>
            <Link href="/lettersystem/add-letter" className="inline-flex">
              <button className="inline-flex items-center gap-2 bg-[#28b4b4] text-white px-4 py-2 rounded-md hover:bg-[#229999] transition-colors">
                <Plus className="h-4 w-4" />
                Add Letter
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-14 px-3 py-3 text-left font-medium">SN</th>
                  <SortableHeader label="Date" columnKey="date" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Title" columnKey="title" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="From" columnKey="from" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="To" columnKey="to" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Contact" columnKey="contact" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Urgency" columnKey="urgency" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLetters.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>No letters found</td>
                  </tr>
                ) : (
                  filteredAndSortedLetters.map((row, index) => (
                    <tr key={`${row.title}-${index}`} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-3">{index + 1}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-3 whitespace-nowrap max-w-[360px]">
                        <div className="truncate" title={row.title}>{row.title}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap max-w-[220px]"><div className="truncate" title={row.from}>{row.from}</div></td>
                      <td className="px-3 py-3 whitespace-nowrap max-w-[220px]"><div className="truncate" title={row.to}>{row.to}</div></td>
                      <td className="px-3 py-3 whitespace-nowrap max-w-[220px]"><div className="truncate" title={row.contact}>{row.contact}</div></td>
                      <td className="px-3 py-3 capitalize">{row.urgency}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button className="p-1 rounded hover:bg-gray-100" aria-label="Edit">
                            <Pencil className="h-4 w-4 text-[#28b4b4]" />
                          </button>
                          <button className="p-1 rounded hover:bg-gray-100" aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, columnKey, sortBy, sortDir, onToggle }) {
  const isActive = sortBy === columnKey;
  return (
    <th className="px-3 py-3 text-left font-medium">
      <button
        type="button"
        onClick={() => onToggle(columnKey)}
        className="inline-flex items-center gap-1 text-left hover:text-gray-900"
      >
        <span>{label}</span>
        <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
        <span className="sr-only">Sort</span>
      </button>
    </th>
  );
}
