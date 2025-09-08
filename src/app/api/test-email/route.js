export async function GET() {
  return Response.json({
    message: 'Email API is working!',
    smtp_configured: !!(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD),
    smtp_email: process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.replace(/(.{3}).*@/, '$1***@') : 'Not configured',
    smtp_host: process.env.SMTP_HOST || 'Not configured',
    smtp_port: process.env.SMTP_PORT || 'Not configured',
    env_check: {
      email_length: process.env.SMTP_EMAIL?.length || 0,
      password_length: process.env.SMTP_PASSWORD?.length || 0,
    }
  });
}
