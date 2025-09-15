'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLetters } from '@/services/firestore';
import { ArrowUpDown, Pencil, Search, Trash2, Plus, Mail } from 'lucide-react';
import Link from 'next/link';
import SendEmailModal from './SendEmailModalSimple';
import SummaryCards from './SummaryCards';

export default function LettersList() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Prevent horizontal scroll on body when modal is open (mobile fix)
  useEffect(() => {
    if (showEmailModal) {
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowX = '';
    }
    return () => {
      document.body.style.overflowX = '';
    };
  }, [showEmailModal]);

  useEffect(() => {
    fetchLetters();
  }, [user]);

  const fetchLetters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedLetters = await getLetters(user.uid);
      console.log('Fetched letters with attachment data:', fetchedLetters.map(letter => ({
        id: letter.id,
        title: letter.title,
        extractedFromImage: letter.extractedFromImage,
        hasAttachment: letter.hasAttachment,
        attachmentUrl: letter.attachmentUrl,
        hasDocument: letter.hasDocument,
        documentMetadata: letter.documentMetadata,
        originalFileMetadata: letter.originalFileMetadata
      })));
      console.log('Full letter objects from Firestore:', JSON.stringify(fetchedLetters, null, 2));
      setLetters(fetchedLetters);
    } catch (err) {
      console.error('Error fetching letters:', err);
      setError('Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedLetters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Convert Firebase data to match your original structure
    const formattedLetters = letters.map(letter => ({
      id: letter.id,
      ...letter, // Keep all original letter data
      date: letter.dateReceived?.toDate ? 
        letter.dateReceived.toDate().toISOString().split('T')[0] : 
        letter.createdAt?.toDate ? 
        letter.createdAt.toDate().toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      title: letter.title || 'Untitled',
      from: letter.senderName || 'Unknown Sender',
      to: user?.displayName || user?.email || 'You',
      contact: letter.senderEmail || letter.senderPhone || 'No contact info',
      urgency: letter.priority || 'normal',
      status: letter.status || 'pending',
      bureau: letter.bureau || '-',
      sentCount: letter.sentCount || 0,
      sendHistory: letter.sendHistory || []
    }));

    const filtered = formattedLetters.filter((row) => {
      if (!normalizedQuery) return true;
      return [row.date, row.title, row.from, row.to, row.contact, row.urgency, row.status, row.bureau]
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
  }, [letters, query, sortBy, sortDir, user]);

  const toggleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortDir('asc');
    }
  };

  const handleRowClick = (letterRow) => {
    console.log('Row clicked! Letter row:', letterRow); // Debug log
    // Find the original letter from the letters array to get all fields including attachment metadata
    const originalLetter = letters.find(l => l.id === letterRow.id);
    console.log('Original letter found:', originalLetter); // Debug log
    
    if (originalLetter) {
      setSelectedLetter(originalLetter);
      setShowEmailModal(true);
    } else {
      console.error('Could not find original letter for ID:', letterRow.id);
      console.error('Available letters:', letters.map(l => ({ id: l.id, title: l.title })));
    }
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
    setSelectedLetter(null);
  };

  const handleStatusUpdate = async (letterId, newStatus) => {
    // Update the local state to reflect the change immediately
    setLetters(prevLetters => 
      prevLetters.map(letter => 
        letter.id === letterId 
          ? { ...letter, status: newStatus }
          : letter
      )
    );
    
    // Optionally refresh from server to ensure consistency
    setTimeout(() => {
      fetchLetters();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Letters</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 max-w-full overflow-x-hidden w-full" style={{ position: 'relative', minWidth: 0 }}>
      <h1 className="text-3xl font-bold">Letters</h1>

      {/* Summary Cards */}
      <SummaryCards letters={letters} />

      <div className="bg-white shadow-md rounded-lg w-full">
        <div className="p-4 md:p-6 min-w-0 w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

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

          <div className="w-full border border-gray-200 rounded-lg overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-[700px] text-sm whitespace-nowrap w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-10 px-2 py-2 text-left font-medium">SN</th>
                  <SortableHeader label="Date" columnKey="date" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Title" columnKey="title" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="From" columnKey="from" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="To" columnKey="to" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Contact" columnKey="contact" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-2 py-2 text-left font-medium">Attachment</th>
                  <SortableHeader label="Urgency" columnKey="urgency" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Status" columnKey="status" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableHeader label="Bureau" columnKey="bureau" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                  {/* <th className="px-3 py-3 text-right font-medium">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLetters.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={10}>
                      {letters.length === 0 ? 'No letters found. Add your first letter!' : 'No letters match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedLetters.map((row, index) => {
                    const originalLetter = letters.find(l => l.id === row.id);
                    const hasOCRAttachment = originalLetter?.attachmentUrl;
                    const hasDocument = originalLetter?.documentMetadata;
                    const hasAnyAttachment = hasOCRAttachment || hasDocument;
                    const hasReceiverEmail = originalLetter?.receiverEmail;
                    
                    // Allow clicking if there's any attachment OR receiver email (at least one)
                    const canSendEmail = hasAnyAttachment || hasReceiverEmail;
                    
                    return (
                      <tr 
                        key={`${row.id}-${index}`} 
                        className={`border-t hover:bg-gray-50 ${canSendEmail ? 'cursor-pointer' : 'cursor-pointer'}`}
                        onClick={() => handleRowClick(row)}
                        title="Click to send via email"
                      >
                        <td className="px-3 py-3">{index + 1}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{row.date}</td>
                        <td className="px-2 py-2 max-w-[180px] align-top">
                          <div className="truncate" title={row.title}>{row.title}</div>
                        </td>
                        <td className="px-2 py-2 max-w-[120px] align-top">
                          <div className="truncate" title={row.from}>{row.from}</div>
                        </td>
                        <td className="px-2 py-2 max-w-[120px] align-top">
                          <div className="truncate" title={row.to}>{row.to}</div>
                        </td>
                        <td className="px-2 py-2 max-w-[120px] align-top">
                          <div className="truncate" title={row.contact}>{row.contact}</div>
                        </td>
                        <td className="px-2 py-2 max-w-[120px] align-top">
                          <div className="flex items-center gap-1">
                            {originalLetter?.documentMetadata ? (
                              <div className="flex items-center gap-1" title={`Attachment: ${originalLetter.documentMetadata.name}`}>
                                <span className="text-green-600">📄</span>
                                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                  {originalLetter.documentMetadata.name}
                                </span>
                              </div>
                            ) : originalLetter?.attachmentUrl ? (
                              <div className="flex items-center gap-1" title="Legacy attachment available">
                                <span className="text-blue-600">�</span>
                                <span className="text-xs text-gray-600">Attachment</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No attachment</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 capitalize align-top">{row.urgency}</td>
                        <td className="px-2 py-2 align-top">
                          <span 
                            className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                              row.status === 'sent' 
                                ? 'text-white' 
                                : getStatusColor(row.status)
                            }`}
                            style={row.status === 'sent' ? { backgroundColor: '#28b4b4' } : {}}
                          >
                            {row.status === 'sent' && row.sentCount > 0 
                              ? `Sent (${row.sentCount}x)` 
                              : row.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 max-w-[120px] align-top">
                          <div className="max-w-[120px]">
                            {row.status === 'sent' && row.sendHistory && row.sendHistory.length > 0 ? (
                              <div className="text-xs">
                                {row.sendHistory.map((send, index) => (
                                  <div key={index} className="flex items-center gap-1 mb-1">
                                    <span>-</span>
                                    <span className="truncate">{send.bureau}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="truncate" title={row.bureau}>
                                {row.bureau}
                              </div>
                            )}
                          </div>
                        </td>
                        {/* <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              className="p-1 rounded hover:bg-gray-100" 
                              aria-label="Edit"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil className="h-4 w-4 text-[#28b4b4]" />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-gray-100" 
                              aria-label="Delete"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td> */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-4 relative"
            style={{
              minHeight: '200px',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SendEmailModal
              isOpen={showEmailModal}
              onClose={handleCloseModal}
              letter={selectedLetter}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>
      )}
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

function getStatusColor(status) {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
