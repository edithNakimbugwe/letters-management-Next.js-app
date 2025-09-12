import { storage } from '../firebase-config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'letters/userId/filename')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} url - The download URL or full path of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (url) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Generate a unique filename with timestamp
 * @param {string} originalName - The original filename
 * @param {string} userId - The user ID
 * @returns {string} - A unique filename
 */
export const generateFileName = (originalName, userId) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  return `letters/${userId}/${timestamp}_${nameWithoutExt}.${extension}`;
};

/**
 * Upload a document file to Firebase Storage for a letter
 * This function is used for both OCR files and regular document attachments
 * When extractedFromImage is true, this stores the original image/PDF that was used for OCR
 * @param {File} file - The document file to upload
 * @param {string} userId - The user ID
 * @param {string} letterId - The letter ID (optional)
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>} - File metadata
 */
export const uploadLetterDocument = async (file, userId, letterId = null) => {
  console.log('=== STARTING FILE UPLOAD TO FIREBASE STORAGE ===');
  console.log('File details:', { name: file.name, size: file.size, type: file.type });
  console.log('User ID:', userId);
  console.log('Letter ID:', letterId);
  
  try {
    // Validate file type (common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload PDF, Word, Excel, text, or image files.');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    const folderPath = letterId ? 
      `letter-documents/${userId}/${letterId}` : 
      `letter-documents/${userId}/temp`;
    
    const fileName = `${timestamp}_${sanitizedName}.${extension}`;
    const fullPath = `${folderPath}/${fileName}`;

    console.log('Generated file path:', fullPath);

    // Upload file
    const storageRef = ref(storage, fullPath);
    console.log('Uploading to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload completed, getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);

    const result = {
      url: downloadURL,
      path: fullPath,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    console.log('File upload successful:', result);
    console.log('=== FILE UPLOAD COMPLETED ===');
    
    return result;
  } catch (error) {
    console.error('=== FILE UPLOAD FAILED ===');
    console.error('Error uploading document:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Download a file from Firebase Storage as a Blob
 * @param {string} url - The download URL of the file
 * @returns {Promise<Blob>} - The file as a Blob
 */
export const downloadFileAsBlob = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
