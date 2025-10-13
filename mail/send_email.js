const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP settings
const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
      },
});

// Function to send verification email
const send_email = async ({ email, subject, html, text }) => {
      try {
            const mailOptions = {
                  from: '"Bright ERP" <brighterp.bfs@gmail.com>',
                  to: email,
                  subject: subject,
                  text: text || '',
                  html: html || '',
            };

            const info = await transporter.sendMail(mailOptions);

            return info;
      } catch (error) {
            console.error('Email send failed:', error);
            throw error;
      }
};

module.exports = send_email;
