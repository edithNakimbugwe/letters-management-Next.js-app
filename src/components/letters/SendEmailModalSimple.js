'use client';

import { useState, useEffect } from 'react';
import { X, Send, Loader2, Download } from 'lucide-react';
import { sendEmailWithAttachment, sendEmailWithMailto, sendEmailWithDownloadLink, validateEmail } from '../../services/email';

export default function SendEmailModal({ isOpen, onClose, letter }) {
  console.log('Modal render - isOpen:', isOpen, 'letter:', letter); // Debug log
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailData, setEmailData] = useState({
    to_email: '',
    subject: '',
    message: ''
  });

  // Update emailData when letter changes
  useEffect(() => {
    if (letter) {
      setEmailData({
        to_email: letter.receiverEmail || '',
        subject: `Letter: ${letter.title || 'Document'}`,
        message: `Dear recipient,\n\nPlease find the attached letter: ${letter.title || 'Document'}\n\nBest regards,\nLetter Management System`
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

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await sendEmailWithAttachment({
        to_email: emailData.to_email,
        subject: emailData.subject,
        message: emailData.message,
        attachment_url: letter?.attachmentUrl || null,
        letter_title: letter?.title || 'Letter',
        from_name: 'Letter Management System'
      });

      if (result.status === 'success') {
        setSuccess(`✅ Email sent successfully to ${emailData.to_email}!`);
        
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <p className="text-sm text-gray-600">
              <span className="font-medium">Attachment:</span> {letter?.attachmentUrl ? 'Available' : 'Not available'}
            </p>
          </div>

          {/* Error/Success Messages */}
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

          {/* Email Form */}
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label htmlFor="to_email" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                id="to_email"
                name="to_email"
                value={emailData.to_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#28b4b4] focus:border-transparent"
                placeholder="recipient@example.com"
              />
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
