const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Send contact form message
const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    // 1. Save to MongoDB
    const newContact = await Contact.create({ name, email, subject, message });

    // 2. Send email notification (optional — works if you set up .env)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <h2>New message from your portfolio</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        `,
      });
    } catch (emailErr) {
      // Email failed but message still saved — that is fine
      console.log('Email not sent (check .env settings):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message received! I will get back to you soon.',
      data: newContact,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
};

// Get all messages (for your own use)
const getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = { sendMessage, getMessages };
