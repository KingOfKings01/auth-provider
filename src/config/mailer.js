const nodemailer = require('nodemailer');

// Robust parsing for .env variables that might carry wrapping quotes or spaces
const cleanEnv = (val) => (val ? val.replace(/['"]/g, '').trim() : '');

const senderEmail = cleanEnv(process.env.SENDER_EMAIL);
const senderPass = cleanEnv(process.env.SENDER_PASS);

// Configure secure transport specifically for Gmail using the supplied app password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: senderEmail,
        pass: senderPass
    }
});



/**
 * Sends OTP verification to target email
 * @param {string} toEmail Target user recipient
 * @param {string} otp Generated random numeric OTP
 * @param {string} appName Application Name for personalization
 */
const sendOTPEmail = async (toEmail, otp, appName = 'Application') => {
    if (!senderEmail || !senderPass) {
        throw new Error('SMTP credentials missing from .env file.');
    }

    const mailOptions = {
        from: `"${appName} Security" <${senderEmail}>`,
        to: toEmail,
        subject: `[OTP Verification] - Your code for ${appName}`,
        text: `Hello,

Your One-Time Password (OTP) to access ${appName} is:

🔑 ${otp}

Please enter this exact code into the desktop prompt to complete verification. If you did not make this request, please contact support immediately.

Best Regards,
${appName} Security Team`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; max-width: 550px; color: #1e293b; margin: 0 auto;">
            <h2 style="color: #4f46e5; margin-top: 0; font-size: 22px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">🛡️ ${appName} Security</h2>
            <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
            
            <div style="background: #f8fafc; border: 1px dashed #4f46e5; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; margin: 25px 0; color: #1e1b4b; border-radius: 8px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);">
                ${otp}
            </div>
            
            <p style="font-size: 14px; color: #475569;">This secure OTP establishes exclusive session ownership. Never share this code.</p>
        </div>`
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };