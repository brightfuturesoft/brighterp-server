const nodemailer = require('nodemailer');

// Create a transporter using Brevo SMTP settings
const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // false for port 587
      auth: {
            user: '7e83dc001@smtp-brevo.com', // your Brevo SMTP login
            pass: 'qkMONbXTKDYmhRQC' // your Brevo SMTP password
      }
});

// Function to send verification email
const send_email = async ({ email, subject, html, text }) => {
      const mailOptions = {
            from: 'no-reply@erp.brightfuturesoft.com', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html // html body
      };


      const info = await transporter.sendMail(mailOptions);

      console.log('Message sent:', info);

      return info;
};


module.exports = send_email;
