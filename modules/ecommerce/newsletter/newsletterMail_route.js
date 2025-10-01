const express = require("express");
const send_email = require("../../../mail/send_email");
const router = express.Router();


router.post("/send-mail", async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    console.log(req.body)

    if (!to || !subject || !body) {
      return res
        .status(400)
        .json({ error: "Emails, subject and body are required" });
    }

    const toEmails = Array.isArray(to) ? to.join(",") : to;

    await send_email({
      email: toEmails,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });

    res.json({ success: true, message: "Mail sent successfully" });
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).json({ error: "Failed to send mail" });
  }
});

module.exports = router;
