'use client';
import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { useAuth } from '@/contexts/AuthContext';
import { createLetter } from '@/services/firestore';
import { useRouter } from 'next/navigation';

export default function AddLetterPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    from: '',
    to: '',
    contact: '',
    urgency: ''
  });
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const convertPdfToImages = async (file) => {
    try {
      // For this example, we'll just process the first page
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw error;
    }
  };

  const createImageFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const performOCR = async (file) => {
    try {
      setProcessing(true);
      let text;

      const worker = await createWorker();

      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      let imageSource;
      if (file.type === 'application/pdf') {
        imageSource = await convertPdfToImages(file);
      } else {
        // For image files, create an image element
        const blob = new Blob([file], { type: file.type });
        imageSource = await createImageFromFile(file);
      }

      console.log('Processing image for OCR...');
      const result = await worker.recognize(imageSource);
      text = result.data.text;

      console.log('OCR Result:', text);

      if (!text || typeof text !== 'string') {
        throw new Error('OCR failed to extract text from the image');
      }

      await worker.terminate();

      console.log('Extracted Text:', text); // Debug log for extracted text

      // Extract information using patterns
      const extractedData = {
        date: extractDate(text),
        title: extractTitle(text),
        from: extractFrom(text),
        to: extractTo(text),
        contact: extractContact(text),
        urgency: determineUrgency(text)
      };

      console.log('Extracted Data:', extractedData); // Debug log

      // Only update fields that have valid data
      setFormData(prevData => ({
        ...prevData,
        ...Object.fromEntries(
          Object.entries(extractedData).filter(([_, value]) => value)
        )
      }));
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to extract text from image. Please try again or enter the information manually.');
    } finally {
      setProcessing(false);
    }
  };

  // Helper functions to extract specific information
  const extractDate = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input for date extraction');
      return '';
    }

    const datePatterns = [
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/,  // dd/mm/yyyy or dd-mm-yyyy
      /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/,     // yyyy/mm/dd or yyyy-mm-dd
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i  // Month dd, yyyy
    ];

    try {
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }
    } catch (e) {
      console.error('Date extraction error:', e);
    }
    return '';
  };

  const extractTitle = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input for title extraction');
      return '';
    }

    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);

      // Look for lines that might contain "subject:" or "re:"
      const subjectLine = lines.find(line =>
        /^(?:subject|re|reference):\s*(.+)/i.test(line)
      );

      if (subjectLine) {
        const match = subjectLine.match(/^(?:subject|re|reference):\s*(.+)/i);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      // If no subject line found, look for a suitable title in the first few lines
      const titleLine = lines.slice(0, 5).find(line =>
        line.length > 10 &&
        line.length < 100 &&
        !line.toLowerCase().match(/date|from|to|dear|subject|sincerely|regards|confidential/i)
      );

      return titleLine || '';
    } catch (e) {
      console.error('Title extraction error:', e);
      return '';
    }
  };

  const extractFrom = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input for sender extraction');
      return '';
    }

    try {
      const patterns = [
        /[Ff]rom:?\s*([^\n]+)/,
        /[Ss]ender:?\s*([^\n]+)/,
        /[Ss]incerely,?\s*([^\n]+)/,
        /[Yy]ours [Ff]aithfully,?\s*([^\n]+)/,
        /[Yy]ours [Ss]incerely,?\s*([^\n]+)/
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
    } catch (e) {
      console.error('Sender extraction error:', e);
    }
    return '';
  };

  const extractTo = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input for recipient extraction');
      return '';
    }

    try {
      const patterns = [
        /[Tt]o:?\s*([^\n]+)/,
        /[Rr]ecipient:?\s*([^\n]+)/,
        /[Dd]ear\s+(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sir\/Madam|Sir|Madam)?\s*([^,\n]+)/
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
    } catch (e) {
      console.error('Recipient extraction error:', e);
    }
    return '';
  };

  const extractContact = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input for contact extraction');
      return '';
    }

    try {
      const patterns = {
        email: /\b[\w\.-]+@[\w\.-]+\.\w+\b/,
        phone: [
          /\b\+?\d{1,3}[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/,  // International format
          /\b\d{3}[-. ]?\d{3}[-. ]?\d{4}\b/,  // US/Canada format
          /\b\d{4}[-. ]?\d{3}[-. ]?\d{3}\b/   // Alternative format
        ]
      };

      // Try to find email first
      const emailMatch = text.match(patterns.email);
      if (emailMatch && emailMatch[0]) return emailMatch[0];

      // Then try phone numbers
      for (const phonePattern of patterns.phone) {
        const phoneMatch = text.match(phonePattern);
        if (phoneMatch && phoneMatch[0]) return phoneMatch[0];
      }
    } catch (e) {
      console.error('Contact extraction error:', e);
    }
    return '';
  };

  const determineUrgency = (text) => {
    const urgencyPatterns = {
      urgent: {
        patterns: ['urgent', 'immediate', 'asap', 'emergency', 'critical'],
        score: 3
      },
      high: {
        patterns: ['priority', 'important', 'attention required', 'time sensitive'],
        score: 2
      },
      medium: {
        patterns: ['attention', 'please review', 'please respond'],
        score: 1
      }
    };

    const textLower = text.toLowerCase();
    let urgencyScore = 0;

    Object.values(urgencyPatterns).forEach(({patterns, score}) => {
      if (patterns.some(pattern => textLower.includes(pattern))) {
        urgencyScore += score;
      }
    });

    console.log('Urgency Score:', urgencyScore); // Debug log

    if (urgencyScore >= 3) return 'urgent';
    if (urgencyScore >= 2) return 'high';
    if (urgencyScore >= 1) return 'medium';
    return 'low';
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSelectedFile(file);
        setError('');
        console.log('Starting OCR for file:', file.name);
        await performOCR(file);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing file. Please try again.');
        setProcessing(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a letter');
      return;
    }

    if (!formData.title || !formData.from) {
      setError('Please fill in at least the title and sender information');
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setSaving(true);
      setShowConfirmModal(false);

      // Convert your original fields to the firebase structure
      const letterData = {
        title: formData.title,
        senderName: formData.from,
        senderAddress: '', // Not in original form
        senderEmail: formData.contact.includes('@') ? formData.contact : '',
        senderPhone: !formData.contact.includes('@') ? formData.contact : '',
        content: `To: ${formData.to}\n\nOriginal extraction from document.`, // Basic content
        priority: formData.urgency || 'normal',
        category: 'general',
        dateReceived: formData.date ? new Date(formData.date) : new Date(),
        status: 'received',
        extractedFromImage: !!selectedFile,
      };

      await createLetter(letterData, user);
      
      setSuccess('Letter added successfully!');
      
      // Reset form
      setFormData({
        date: '',
        title: '',
        from: '',
        to: '',
        contact: '',
        urgency: ''
      });
      
      setSelectedFile(null);

      // Redirect to letters list after 2 seconds
      setTimeout(() => {
        router.push('/lettersystem/letters');
      }, 2000);

    } catch (error) {
      console.error('Error adding letter:', error);
      setError('Failed to add letter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Letter</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Enter letter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Sender's name or department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Recipient's name or department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-[#374a63] focus:ring-1 focus:ring-[#374a63]"
                placeholder="Contact number or email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
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
            <label className="block text-sm font-medium text-gray-700">Upload Letter</label>
            <div className="mt-1 flex items-center justify-center w-full">
              <label className={`w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-50 ${processing ? 'opacity-50' : ''}`}>
                {processing ? (
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin w-8 h-8 mb-2 text-[#28b4b4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium text-[#28b4b4]">Processing document...</span>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center">
                    <svg className="w-8 h-8 mb-2 text-[#28b4b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-[#28b4b4]">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500 mt-1">Click to change file</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-500">PDF, PNG, JPG, JPEG, TIFF, BMP (Max 10MB)</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={handleFileChange}
                  disabled={processing}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/lettersystem/letters')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={processing || saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#28b4b4] text-white px-4 py-2 rounded-lg hover:bg-[#229999] transition-colors disabled:opacity-50"
              disabled={processing || saving}
            >
              {saving ? 'Adding Letter...' : 'Add Letter'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 shadow-lg" style={{ borderColor: '#28b4b4' }}>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Letter Submission
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                <strong>Important:</strong> Once you add this letter, you will <span className="text-red-600 font-semibold">not be able to edit or delete it</span>. 
                Please make sure all information is correct before proceeding.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{ backgroundColor: '#28b4b4' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#229999'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28b4b4'}
              >
                {saving ? 'Adding Letter...' : 'Yes, Add Letter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
