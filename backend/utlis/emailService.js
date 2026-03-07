const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── Generate 6-digit OTP ───────────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── HTML email templates ───────────────────────────────────────────────────────
const getOTPEmailHTML = (otp, purpose) => {
    const titles = {
        signup: { heading: 'Verify Your Email', sub: 'Use the OTP below to complete your TechiGuru registration.' },
        forgot: { heading: 'Reset Your Password', sub: 'Use the OTP below to reset your TechiGuru account password.' },
    };
    const t = titles[purpose] || titles.signup;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#05070f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05070f;padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0"
        style="background:#0c0e24;border-radius:20px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:18px;">T</span>
              </div>
              <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">TechiGuru</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f0f0f8;">${t.heading}</h1>
            <p style="margin:0 0 32px;color:#8892aa;font-size:14px;line-height:1.6;">${t.sub}</p>

            <!-- OTP Box -->
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#818cf8;">Your One-Time Password</p>
              <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#c7d2fe;font-family:'Courier New',monospace;">${otp}</div>
              <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Valid for <strong style="color:#a5b4fc;">10 minutes</strong>. Do not share this with anyone.</p>
            </div>

            <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">
              If you didn't request this, you can safely ignore this email. Your account will not be affected.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="margin:0;font-size:11px;color:#374151;">© ${new Date().getFullYear()} TechiGuru. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// ── Send OTP email ─────────────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, purpose = 'signup') => {
    const subjects = {
        signup: '🔐 Your TechiGuru Verification Code',
        forgot: '🔑 Your TechiGuru Password Reset Code',
    };

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `TechiGuru <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subjects[purpose] || subjects.signup,
        html: getOTPEmailHTML(otp, purpose),
    });
};

module.exports = { generateOTP, sendOTPEmail };
