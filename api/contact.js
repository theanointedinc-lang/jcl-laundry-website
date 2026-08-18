const https = require('https');

module.exports = async (req, res) => {
  // CORS Headers for safety
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing required fields' }));
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Resend API Key is not configured on Vercel. Please set RESEND_API_KEY in Environment Variables.' }));
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'JCL Contact <onboarding@resend.dev>',
        to: ['thejustplace@gmail.com'],
        subject: `JCL Contact: ${subject || 'New Message'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #041536; border-bottom: 2px solid #005AE6; padding-bottom: 8px; margin-top: 0;">New JCL Contact Form Entry</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p style="margin-top: 20px; font-weight: bold; color: #041536;">Message:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #005AE6; border-radius: 4px; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.5;">${message}</div>
          </div>
        `
      })
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      res.writeHead(resendResponse.status, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: data.message || 'Failed to send email via Resend' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, id: data.id }));
  } catch (error) {
    console.error('Serverless Function Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
  }
};
