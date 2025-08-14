function generateVerificationEmail(userName, workspaceName, verifyLink) {
      const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
        <tr>
            <td style="padding: 30px;">
                <h1 style="color: #4a4a4a; margin-bottom: 20px;">Verify Your Account</h1>
                <p style="margin-bottom: 20px;">Hello {{user_name}},</p>
                <p style="margin-bottom: 20px;">Thank you for signing up for {{workspace_name}}. To complete your registration and verify your account, please click the button below:</p>
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                        <td style="background-color: #007bff; border-radius: 4px;">
                            <a href="{{verify_link}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">Verify Your Account</a>
                        </td>
                    </tr>
                </table>
                <p style="margin-bottom: 20px;">If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                <p style="margin-bottom: 20px; word-break: break-all;"><a href="{{verify_link}}" style="color: #007bff;">{{verify_link}}</a></p>
                <p style="margin-bottom: 20px;">If you didn't create an account with {{workspace_name}}, please ignore this email.</p>
                <p style="margin-bottom: 20px;">Best regards,<br>The {{workspace_name}} Team</p>
            </td>
        </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align: center; padding-top: 20px; color: #888888; font-size: 12px;">
                <p>&copy; 2023 {{workspace_name}}. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

      return template
            .replace(/{{user_name}}/g, userName)
            .replace(/{{workspace_name}}/g, workspaceName)
            .replace(/{{verify_link}}/g, verifyLink);
}


module.exports = generateVerificationEmail
