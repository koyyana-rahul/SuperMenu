import nodemailer from "nodemailer";
import config from "../config/config.js";

let transporter;

/**
 * Initializes the email transporter based on the environment.
 * In development, it uses Ethereal to create a fake inbox for previewing emails.
 * In production, it uses the configured SMTP provider.
 */
const initializeTransporter = async () => {
  if (config.nodeEnv === "development") {
    // Create a test account with Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal test account created for email previews.");
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  } else {
    // Use the real SMTP provider for production
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
};

// Initialize the transporter when the module is first loaded
initializeTransporter().catch(console.error);

const sendEmail = async (options) => {
  const mailOptions = {
    from: config.smtp.from,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };
  const info = await transporter.sendMail(mailOptions);
  if (config.nodeEnv === "development") {
    console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

export default sendEmail;
