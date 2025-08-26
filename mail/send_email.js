const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP settings
const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // ✅ 'server' এর জায়গায় host দিতে হবে
      port: 465,
      secure: true, // true for port 465, false for 587
      auth: {
            user: 'brighterp.bfs@gmail.com', // ✅ তোমার Gmail address
            pass: 'rgqi hypm hgmf kvdo',     // ✅ Gmail App Password (not account password)
      },
});

// Function to send verification email
const send_email = async ({ email, subject, html, text }) => {
      try {
            const mailOptions = {
                  from: '"Bright ERP" <brighterp.bfs@gmail.com>', // sender address with name
                  to: email, // list of receivers
                  subject: subject, // Subject line
                  text: text || '', // plain text body
                  html: html || '', // html body
            };

            const info = await transporter.sendMail(mailOptions);

            console.log('✅ Message sent:', info.messageId);

            return info;
      } catch (error) {
            console.error('❌ Email send failed:', error);
            throw error; // error re-throw for handling outside
      }
};

module.exports = send_email;
