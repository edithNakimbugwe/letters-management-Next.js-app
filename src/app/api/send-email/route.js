import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { to_email, subject, message, attachment_url, letter_title } = await request.json();

    // Log for debugging
    console.log('Email request received:', { to_email, subject, letter_title });

    // Validate required fields
    if (!to_email || !subject) {
      return Response.json(
        { error: 'Missing required fields: to_email and subject are required' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('Missing SMTP environment variables');
      return Response.json(
        { error: 'Server email configuration not found' },
        { status: 500 }
      );
    }

    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      email: process.env.SMTP_EMAIL?.replace(/(.{3}).*@/, '$1***@')
    });

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify transporter configuration
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Prepare email content
    let emailContent = message || `Please find the letter: ${letter_title}`;
    
    if (attachment_url) {
      emailContent += `\n\nAttachment: ${attachment_url}`;
      emailContent += `\n\nNote: Please download the attachment from the link above.`;
    } else {
      emailContent += `\n\nNote: This letter does not have a file attachment.`;
    }
    
    emailContent += `\n\nSent from Letter Management System`;

    // Email options
    const mailOptions = {
      from: {
        name: 'Letter Management System',
        address: process.env.SMTP_EMAIL,
      },
      to: to_email,
      subject: subject,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28b4b4; border-bottom: 2px solid #28b4b4; padding-bottom: 10px;">
            Letter Management System
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Letter: ${letter_title || 'Document'}</h3>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              ${message ? message.replace(/\n/g, '<br>') : `Please find the letter: ${letter_title}`}
            </div>
          </div>

          ${attachment_url ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3;">
              <strong>📎 Attachment Available:</strong><br>
              <a href="${attachment_url}" style="color: #2196f3; text-decoration: none;" target="_blank">
                Click here to download the attachment
              </a>
              <br><small style="color: #666;">Note: Please download the attachment from the link above.</small>
            </div>
          ` : `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
              <strong>ℹ️ Note:</strong> This letter does not have a file attachment.
            </div>
          `}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This email was sent automatically from the Letter Management System.</p>
            <p>If you have any questions, please contact the system administrator.</p>
          </div>
        </div>
      `,
    };

    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return Response.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('Detailed error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    
    return Response.json(
      { 
        error: 'Failed to send email', 
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
