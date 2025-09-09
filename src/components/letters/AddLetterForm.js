'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createLetter } from '../../services/firestore';
import { uploadFile, generateFileName } from '../../services/storage';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';

const AddLetterForm = () => {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    senderName: '',
    senderAddress: '',
    senderEmail: '',
    senderPhone: '',
    receiverEmail: '', // Add receiver email field
    content: '',
    priority: 'normal',
    category: 'general',
    dateReceived: new Date().toISOString().split('T')[0], // Today's date
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
      
      if (validTypes.includes(fileType)) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid image file (JPEG, PNG, GIF, BMP) or PDF');
        setSelectedFile(null);
      }
    }
  };

  const convertPdfToImages = async (file) => {
    try {
      // Dynamically import PDF.js to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Process only the first page
      
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
            reject(new Error('Failed to convert PDF to image'));
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
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const preprocessImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    
    // Get image data for preprocessing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      // Increase contrast
      const contrast = gray > 128 ? 255 : 0;
      data[i] = contrast;     // Red
      data[i + 1] = contrast; // Green
      data[i + 2] = contrast; // Blue
    }
    
    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL();
  };

  const extractTextFromImage = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    let progressInterval = null;
    let worker = null;

    try {
      setProcessing(true);
      setOcrProgress(0);
      setError('');

      let imageSource;

      if (selectedFile.type === 'application/pdf') {
        setOcrProgress(10);
        imageSource = await convertPdfToImages(selectedFile);
      } else {
        setOcrProgress(10);
        const img = await createImageFromFile(selectedFile);
        imageSource = preprocessImage(img);
      }

      setOcrProgress(20);

      // Create Tesseract worker
      worker = await createWorker();
      setOcrProgress(30);
      
      await worker.loadLanguage('eng');
      setOcrProgress(50);
      
      await worker.initialize('eng');
      setOcrProgress(70);

      // Perform OCR with progress simulation
      const ocrPromise = worker.recognize(imageSource);
      
      // Simulate progress during OCR (since we can't use logger)
      progressInterval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev < 85) {
            return prev + 2;
          }
          return prev;
        });
      }, 200);

      const { data: { text } } = await ocrPromise;
      
      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setOcrProgress(100);

      // Auto-populate form fields based on extracted text
      if (text.trim()) {
        // Try to extract information from the text
        const lines = text.split('\n').filter(line => line.trim());
        
        // Simple heuristics to extract information
        let extractedTitle = '';
        let extractedSender = '';
        let extractedContent = text.trim();

        // Look for potential title (usually first non-empty line or line with "Subject:", "Re:", etc.)
        const titlePatterns = /^(subject|re|title|regarding):\s*(.+)/i;
        for (let line of lines) {
          const titleMatch = line.match(titlePatterns);
          if (titleMatch) {
            extractedTitle = titleMatch[2].trim();
            break;
          }
        }

        // If no title pattern found, use first substantial line
        if (!extractedTitle && lines.length > 0) {
          extractedTitle = lines[0].length > 50 ? lines[0].substring(0, 47) + '...' : lines[0];
        }

        // Look for sender information
        const senderPatterns = /^(from|sender|name):\s*(.+)/i;
        for (let line of lines) {
          const senderMatch = line.match(senderPatterns);
          if (senderMatch) {
            extractedSender = senderMatch[2].trim();
            break;
          }
        }

        // Update form data
        setFormData(prev => ({
          ...prev,
          title: extractedTitle || prev.title,
          senderName: extractedSender || prev.senderName,
          content: extractedContent
        }));

        setSuccess('Text extracted successfully! Please review and edit the information below.');
      } else {
        setError('No text could be extracted from the image. Please try a clearer image or enter the information manually.');
      }

    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to extract text from image. Please try again or enter the information manually.');
    } finally {
      // Cleanup
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (worker) {
        try {
          await worker.terminate();
        } catch (terminateError) {
          console.warn('Error terminating worker:', terminateError);
        }
      }
      setProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a letter');
      return;
    }

    if (!formData.title || !formData.senderName || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      let attachmentUrl = null;
      
      // Upload file if one was selected
      if (selectedFile) {
        try {
          const fileName = generateFileName(selectedFile.name, user.uid);
          attachmentUrl = await uploadFile(selectedFile, fileName);
          console.log('File uploaded successfully:', attachmentUrl);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          setError('Failed to upload file. Please try again.');
          setLoading(false);
          return;
        }
      }

      const letterData = {
        ...formData,
        dateReceived: new Date(formData.dateReceived),
        status: 'received', // Default status
        extractedFromImage: !!selectedFile, // Track if this was extracted from an image
        attachmentUrl, // Store the file URL
        hasAttachment: !!attachmentUrl, // Boolean flag for easier querying
      };

      await createLetter(letterData, user);
      
      setSuccess('Letter added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        senderName: '',
        senderAddress: '',
        senderEmail: '',
        senderPhone: '',
        receiverEmail: '',
        content: '',
        priority: 'normal',
        category: 'general',
        dateReceived: new Date().toISOString().split('T')[0],
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Letter</h2>
        
        {/* OCR Section */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">OCR - Extract Text from Image/PDF</h3>
          <p className="text-sm text-blue-600 mb-4">
            Upload an image or PDF of a letter to automatically extract text and populate the form fields below.
          </p>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-sm text-gray-700">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <Button
                  type="button"
                  onClick={extractTextFromImage}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? 'Processing...' : 'Extract Text'}
                </Button>
              </div>
            )}
            
            {processing && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
                <p className="text-sm text-blue-600 mt-1">Processing... {ocrProgress}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Display who will be recorded as receiver */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f0fffe' }}>
          <p className="text-sm" style={{ color: '#28b4b4' }}>
            <strong>Received by:</strong> {userProfile?.displayName || user?.displayName || user?.email}
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Letter Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Letter Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter letter title"
            />
          </div>

          {/* Sender Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name *
              </label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter sender's name"
              />
            </div>

            <div>
              <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Sender Email
              </label>
              <input
                type="email"
                id="senderEmail"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter sender's email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Sender Phone
              </label>
              <input
                type="tel"
                id="senderPhone"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter sender's phone"
              />
            </div>

            <div>
              <label htmlFor="receiverEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Receiver Email
              </label>
              <input
                type="email"
                id="receiverEmail"
                name="receiverEmail"
                value={formData.receiverEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter receiver's email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateReceived" className="block text-sm font-medium text-gray-700 mb-2">
                Date Received
              </label>
              <input
                type="date"
                id="dateReceived"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              {/* Empty div for grid alignment */}
            </div>
          </div>

          {/* Sender Address */}
          <div>
            <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Sender Address
            </label>
            <textarea
              id="senderAddress"
              name="senderAddress"
              value={formData.senderAddress}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter sender's address"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="general">General</option>
                <option value="complaint">Complaint</option>
                <option value="inquiry">Inquiry</option>
                <option value="request">Request</option>
                <option value="application">Application</option>
                <option value="official">Official</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Letter Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Letter Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the letter content or use OCR to extract from an image..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/lettersystem/letters')}
              disabled={loading || processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || processing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Adding Letter...' : 'Add Letter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLetterForm;
