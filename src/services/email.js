// Simple email service using mailto links
// For production, you would integrate with EmailJS, SendGrid, or similar service

/**
 * Initialize EmailJS (placeholder for when you set up EmailJS)
 */
export const initializeEmailJS = () => {
  console.log('EmailJS would be initialized here');
};

/**
 * Send an email with attachment using our API route
 * @param {Object} emailData - Email data including document attachment
 * @returns {Promise<Object>} - Response object
 */
export const sendEmailWithAttachment = async (emailData) => {
  try {
    console.log('Sending email request to API...');
    
    const requestBody = {
      to_email: emailData.to_email,
      subject: emailData.subject || `Letter: ${emailData.letter_title}`,
      message: emailData.message,
      attachment_url: emailData.attachment_url, // OCR image attachment
      document_attachment: emailData.document_attachment, // Document attachment metadata
      letter_title: emailData.letter_title,
    };

    console.log('Request payload:', {
      ...requestBody,
      has_document: !!requestBody.document_attachment,
      has_attachment: !!requestBody.attachment_url
    });
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (!response.ok) {
      throw new Error(result.details || result.error || 'Failed to send email');
    }

    return {
      status: 'success',
      message: 'Email sent successfully',
      data: result,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Fallback: Send email using mailto (backup method)
 * @param {Object} emailData - Email data including document attachment
 * @returns {Promise<Object>} - Response object
 */
export const sendEmailWithMailto = async (emailData) => {
  try {
    // Build email body with all attachments
    let emailBody = emailData.message || `Please find the letter: ${emailData.letter_title}`;
    
    if (emailData.attachment_url) {
      emailBody += `\n\nOCR Image URL: ${emailData.attachment_url}`;
    }
    
    if (emailData.document_attachment && emailData.document_attachment.url) {
      emailBody += `\n\nDocument Attachment: ${emailData.document_attachment.name}`;
      emailBody += `\n\nDocument URL: ${emailData.document_attachment.url}`;
      emailBody += `\n\nFile Size: ${(emailData.document_attachment.size / 1024 / 1024).toFixed(2)} MB`;
    }
    
    if (!emailData.attachment_url && !emailData.document_attachment) {
      emailBody += `\n\nNote: This letter does not have any file attachments.`;
    } else {
      emailBody += `\n\nNote: Please download the attachments from the links above.`;
    }
    
    emailBody += `\n\nSent from Letter Management System`;
    
    const subject = encodeURIComponent(emailData.subject || `Letter: ${emailData.letter_title}`);
    const body = encodeURIComponent(emailBody);
    
    const mailtoLink = `mailto:${emailData.to_email}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.open(mailtoLink);
    
    return { 
      status: 'success', 
      message: 'Email client opened with pre-filled information' 
    };
  } catch (error) {
    console.error('Error opening email client:', error);
    throw error;
  }
};

/**
 * Alternative: Show downloadable link (for demonstration)
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} - Response object
 */
export const sendEmailWithDownloadLink = async (emailData) => {
  try {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = emailData.attachment_url;
    link.download = `${emailData.letter_title || 'letter'}.pdf`;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { 
      status: 'success', 
      message: 'File download initiated' 
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
