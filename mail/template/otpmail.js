const generate2FAEmail = (userName, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your 2FA</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .otp {
                display: inline-block;
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                background-color: #007bff;
                padding: 10px 20px;
                border-radius: 6px;
                letter-spacing: 4px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777777;
                text-align: center;
            }
            p {
                line-height: 1.6;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Bright ERP - Two Factor Authentication</h2>
            </div>
            <p>Hi ${userName},</p>
            <p>You requested to enable two-factor authentication (2FA) on your account.</p>
            <p>Please use the following OTP to verify your email and complete the setup:</p>
            <p class="otp">${otp}</p>
            <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Bright ERP. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = generate2FAEmail;
