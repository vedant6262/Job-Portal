const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"JobPortal" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to JobPortal!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Welcome to JobPortal!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining JobPortal. We're excited to help you find your dream job!</p>
        <p>With JobPortal you can:</p>
        <ul>
          <li>Browse thousands of jobs from top companies</li>
          <li>Get AI-powered job recommendations</li>
          <li>Track your applications in real-time</li>
          <li>Connect with recruiters directly</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/jobs" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Browse Jobs</a>
        </div>
        <p>Best regards,<br/>The JobPortal Team</p>
      </div>
    `,
  });
};

const sendApplicationConfirmation = async (email, name, jobTitle, companyName) => {
  await sendEmail({
    to: email,
    subject: `Application Submitted - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Application Submitted!</h2>
        <p>Hi ${name},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received successfully.</p>
        <p>You can track your application status from your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/applications" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Track Application</a>
        <p>Good luck!</p>
      </div>
    `,
  });
};

const sendInterviewInvitation = async (email, name, jobTitle, companyName, date, time, link) => {
  await sendEmail({
    to: email,
    subject: `Interview Invitation - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Interview Invitation!</h2>
        <p>Hi ${name},</p>
        <p>Congratulations! You have been invited for an interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${link ? `<p><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>` : ''}
        <p>Please confirm your availability from your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/interviews" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Interview Details</a>
      </div>
    `,
  });
};

const sendStatusUpdate = async (email, name, jobTitle, companyName, status) => {
  const messages = {
    SHORTLISTED: { subject: 'You\'ve Been Shortlisted!', message: 'Congratulations! You have been shortlisted for the position.' },
    REJECTED: { subject: 'Application Update', message: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.' },
    OFFERED: { subject: 'Offer Letter!', message: 'Congratulations! We are pleased to offer you the position.' },
  };

  const msg = messages[status];
  if (!msg) return;

  await sendEmail({
    to: email,
    subject: `${msg.subject} - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">${msg.subject}</h2>
        <p>Hi ${name},</p>
        <p>${msg.message}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/applications" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Details</a>
      </div>
    `,
  });
};

module.exports = { transporter, sendEmail, sendWelcomeEmail, sendApplicationConfirmation, sendInterviewInvitation, sendStatusUpdate };
