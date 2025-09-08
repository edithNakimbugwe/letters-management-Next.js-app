# Letter Email Forwarding Feature

## Overview
The letter management system now includes functionality for receptionists to forward letters to their intended recipients via email.

## New Features

### 1. File Upload and Storage
- Letters can now have PDF or image attachments
- Files are stored in Firebase Storage
- Attachment URLs are saved in Firestore

### 2. Receiver Email Field
- Added a "Receiver Email" field in the Add Letter form
- This specifies who should receive the letter via email

### 3. Clickable Letter Rows
- Letter rows in the letters list are now clickable
- Rows are only clickable if:
  - The letter has an attachment (PDF/image)
  - The letter has a receiver email address
- Visual indicators show which letters can be emailed:
  - 📎 icon for letters with attachments
  - ✉️ icon for letters that can be emailed

### 4. Email Modal
- Clicking a letter row opens an email modal
- Pre-filled with receiver's email and letter details
- Two options available:
  - **Open Email Client**: Opens default email client with pre-filled content
  - **Download File**: Directly downloads the attachment

## How to Use

### For Receptionists:

1. **Adding a Letter with Attachment**:
   - Go to "Add Letter" page
   - Fill in letter details including "Receiver Email"
   - Upload a PDF or image file
   - Submit the form

2. **Forwarding a Letter**:
   - Go to the Letters list page
   - Look for letters with attachment (📎) and email (✉️) icons
   - Click on the letter row
   - In the modal:
     - Verify/edit the recipient email
     - Modify the subject or message if needed
     - Choose either "Open Email Client" or "Download File"

### Visual Indicators:
- **📎**: Letter has an attachment
- **✉️**: Letter can be sent via email (has both attachment and receiver email)
- **Cursor pointer**: Row is clickable
- **Hover effect**: Shows tooltip explaining the action

## Technical Implementation

### New Files:
- `src/services/storage.js` - Firebase Storage utilities
- `src/services/email.js` - Email handling service
- `src/components/letters/SendEmailModal.js` - Email modal component
- `src/components/EmailJSInitializer.js` - Email service initializer

### Modified Files:
- `src/firebase-config/firebase.js` - Added Firebase Storage
- `src/components/letters/AddLetterForm.js` - Added file upload and receiver email
- `src/components/letters/LettersList.js` - Made rows clickable and added modal
- `src/app/layout.js` - Added email service initializer

### Database Changes:
Letters collection now includes:
- `attachmentUrl` - URL of uploaded file
- `hasAttachment` - Boolean flag for easier querying
- `receiverEmail` - Email of intended recipient

## Email Service Options

The current implementation uses `mailto:` links to open the default email client. For production environments, you may want to integrate with:

- **EmailJS** - Client-side email service
- **SendGrid** - Server-side email API
- **Nodemailer** - Server-side email with SMTP
- **AWS SES** - Amazon's email service

## Security Considerations

1. **File Upload**: Files are stored in Firebase Storage with proper access controls
2. **Email Validation**: Client-side validation for email addresses
3. **Access Control**: Only authenticated users can upload and send letters
4. **File Types**: Limited to PDF and image files for security

## Future Enhancements

1. **Email Templates**: Create custom email templates
2. **Delivery Tracking**: Track if emails were sent successfully
3. **Bulk Operations**: Send multiple letters at once
4. **Email History**: Log all email activities
5. **Attachment Previews**: Show attachment previews in the modal
