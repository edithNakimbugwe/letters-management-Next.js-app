'use client';

import { useState, useEffect } from 'react';
import { X, Send, Loader2, Download } from 'lucide-react';
import { sendEmailWithAttachment, sendEmailWithMailto, sendEmailWithDownloadLink, validateEmail } from '../../services/email';
import { trackLetterSend, getBureaus } from '../../services/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function SendEmailModal({ isOpen, onClose, letter, onStatusUpdate }) {
  const [bureaus, setBureaus] = useState([]);
  const [bureauMembers, setBureauMembers] = useState([]);
  const [emailData, setEmailData] = useState({
    to_email: '',
    subject: '',
    message: '',
    bureau: ''
  });

  // Fetch bureaus on mount
  useEffect(() => {
    async function fetchBureaus() {
      const data = await getBureaus();
      setBureaus(data);
    }
    fetchBureaus();
  }, []);

  // Update members when bureau changes
  useEffect(() => {
    if (emailData.bureau) {
      const bureau = bureaus.find(b => b.name === emailData.bureau);
      setBureauMembers(bureau ? bureau.members : []);
      setEmailData(prev => ({ ...prev, to_email: '' }));
    } else {
      setBureauMembers([]);
      setEmailData(prev => ({ ...prev, to_email: '' }));
    }
  }, [emailData.bureau, bureaus]);
  const { user } = useAuth();
  console.log('Modal render - isOpen:', isOpen, 'letter:', letter); // Debug log
  console.log('Letter attachment data:', {
    extractedFromImage: letter?.extractedFromImage,
    hasAttachment: letter?.hasAttachment,
    attachmentUrl: letter?.attachmentUrl,
    hasDocument: letter?.hasDocument,
    documentMetadata: letter?.documentMetadata,
    originalFileMetadata: letter?.originalFileMetadata
  }); // Debug log
  if (letter && isOpen) {
    console.log('=== DEBUGGING LETTER OBJECT ===');
    console.log('Full letter object keys:', Object.keys(letter));
    console.log('Full letter object (pretty print):');
    console.log(JSON.stringify(letter, null, 2));
    console.log('=== END LETTER OBJECT DEBUG ===');
  }

  // Helper function to get the main attachment for the letter
  const getMainAttachment = (letter) => {
    // Priority: documentMetadata (new format) > originalFileMetadata > attachmentUrl (legacy)
    if (letter?.documentMetadata) {
      return {
        type: 'document',
        metadata: letter.documentMetadata,
        url: letter.documentMetadata.url
      };
    }
    if (letter?.originalFileMetadata) {
      return {
        type: 'original',
        metadata: letter.originalFileMetadata,
        url: letter.originalFileMetadata.url
      };
    }
    if (letter?.attachmentUrl) {
      return {
        type: 'legacy',
        url: letter.attachmentUrl
      };
    }
    return null;
  };

  const mainAttachment = getMainAttachment(letter);
  console.log('Main attachment detected:', mainAttachment);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update emailData when letter changes
  useEffect(() => {
    if (letter) {
      setEmailData({
        to_email: letter.receiverEmail || '',
        subject: `Letter: ${letter.title || 'Document'}`,
        message: `Dear recipient,\n\nPlease find the attached letter: ${letter.title || 'Document'}\n\nBest regards,\nLetter Management System`,
        bureau: ''
      });
    }
  }, [letter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailData.to_email) {
      setError('Please enter recipient email address');
      return;
    }

    if (!validateEmail(emailData.to_email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if letter has any attachments (OCR file stored as documentMetadata or legacy attachmentUrl)
    if (!mainAttachment) {
      setError('No attachments found for this letter');
      return;
    }

    if (!emailData.bureau) {
      setError('Please select the bureau to send the letter to');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await sendEmailWithAttachment({
        to_email: emailData.to_email,
        subject: emailData.subject,
        message: emailData.message,
        attachment_url: letter?.attachmentUrl || null, // Legacy OCR image URL
        document_attachment: letter?.documentMetadata || null, // Main attachment (OCR file or document)
        letter_title: letter?.title || 'Letter',
        from_name: 'Letter Management System'
      });

      if (result.status === 'success') {
        // Track the letter send with bureau and recipient information
        let sendTrackingResult = null;
        if (letter?.id && user) {
          try {
            sendTrackingResult = await trackLetterSend(letter.id, emailData.bureau, emailData.to_email, user);
            console.log('Letter send tracked successfully:', sendTrackingResult);
          } catch (err) {
            console.error('Error tracking letter send:', err);
          }
        }
        
        const sendCountText = sendTrackingResult ? ` (Send #${sendTrackingResult.sendNumber})` : '';
        setSuccess(`✅ Email sent successfully to ${emailData.to_email}${sendCountText}!`);
        
        // Notify parent component to refresh data
        if (onStatusUpdate) {
          onStatusUpdate(letter.id, 'sent');
        }
        
        // Close modal after 4 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
          setError('');
        }, 4000);
      } else {
        setError('Failed to send email. Please try again.');
      }

    } catch (err) {
      console.error('Error sending email:', err);
      setError(`Failed to send email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!letter?.attachmentUrl) {
      setError('No attachment found for this letter');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await sendEmailWithDownloadLink({
        attachment_url: letter.attachmentUrl,
        letter_title: letter.title
      });

      setSuccess('File download initiated!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
        setError('');
      }, 2000);

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md border-2 shadow-lg" style={{ borderColor: '#28b4b4' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Send Letter via Email</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Letter Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium text-sm text-gray-700">Letter Details:</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Title:</span> {letter?.title || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">From:</span> {letter?.senderName || 'N/A'}
            </p>
            
            {/* Attachment Information */}
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Attachments:</span>
              </p>
              {letter?.documentMetadata && (
                <div className="ml-4 text-xs text-green-600">
                  � Attachment: {letter.documentMetadata.name} ({(letter.documentMetadata.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              {letter?.attachmentUrl && !letter?.documentMetadata && (
                <div className="ml-4 text-xs text-blue-600">
                  � Legacy Attachment: Available
                </div>
              )}
              {!letter?.attachmentUrl && !letter?.documentMetadata && (
                <div className="ml-4 text-xs text-gray-500">
                  No attachments available
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f0fffe', borderColor: '#28b4b4', color: '#28b4b4', border: '1px solid' }}>
              {success}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSendEmail} className="space-y-4">

            <div>
              <label htmlFor="bureau" className="block text-sm font-medium text-gray-700 mb-1">
                Bureau (To Send To) *
              </label>
              <select
                id="bureau"
                name="bureau"
                value={emailData.bureau}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent"
              >
                <option value="">Select bureau to send to</option>
                {bureaus.map(bureau => (
                  <option key={bureau.id} value={bureau.name}>{bureau.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="to_email" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
              </label>
              <select
                id="to_email"
                name="to_email"
                value={emailData.to_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent"
                disabled={!emailData.bureau || bureauMembers.length === 0}
              >
                <option value="">{!emailData.bureau ? 'Select a bureau first' : bureauMembers.length === 0 ? 'No members in this bureau' : 'Select an email'}</option>
                {bureauMembers.map((email, idx) => (
                  <option key={idx} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={emailData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent"
              />
            </div>


            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={emailData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              {/* Show download button only if there's an attachment */}
              {letter?.attachmentUrl && (
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </button>
              )}
              
              {/* Primary send button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#28b4b4] text-white rounded-md hover:bg-[#28b4b4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
