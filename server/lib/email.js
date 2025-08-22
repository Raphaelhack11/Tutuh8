import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export async function sendEmail(to, subject, html) {
  const mail = { from: process.env.EMAIL_USER, to, subject, html };
  await transporter.sendMail(mail);
}

export async function sendVerificationEmail(to, token) {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${base}/verify?token=${token}`;
  const html = `
    <h3>Welcome to ProfitBliss</h3>
    <p>Click below to verify your email:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>If you didn't sign up, ignore this email.</p>
  `;
  await sendEmail(to, "ProfitBliss — Verify your email", html);
}

export async function sendDepositCreated(to, amount, currency) {
  const html = `
    <h3>ProfitBliss — Deposit Received (Pending)</h3>
    <p>We recorded a deposit request of <strong>$${amount}</strong> (${currency}).</p>
    <p>We will credit your account after blockchain confirmations.</p>
  `;
  await sendEmail(to, "ProfitBliss — Deposit pending", html);
}

export async function sendDepositConfirmed(to, amount, currency) {
  const html = `
    <h3>ProfitBliss — Deposit Confirmed</h3>
    <p>Your deposit of <strong>$${amount}</strong> (${currency}) has been confirmed and credited to your ProfitBliss account.</p>
    <p>Thank you for using ProfitBliss.</p>
  `;
  await sendEmail(to, "ProfitBliss — Deposit confirmed", html);
}

export async function sendSubscriptionEmail(to, planName, amount, totalRoi) {
  const html = `
    <h3>ProfitBliss — Subscription Successful</h3>
    <p>You have subscribed to <strong>${planName}</strong> with $${amount}. Total ROI: ${totalRoi}%.</p>
    <p>View your active plans in the dashboard.</p>
  `;
  await sendEmail(to, "ProfitBliss — Plan subscribed", html);
}

export async function sendWithdrawRequested(to, amount, toAddress) {
  const html = `
    <h3>ProfitBliss — Withdrawal Requested</h3>
    <p>Your withdrawal of <strong>$${amount}</strong> to <code>${toAddress}</code> is pending admin approval.</p>
  `;
  await sendEmail(to, "ProfitBliss — Withdrawal requested", html);
}

export async function sendWithdrawApproved(to, amount) {
  const html = `
    <h3>ProfitBliss — Withdrawal Approved</h3>
    <p>Your withdrawal of <strong>$${amount}</strong> has been approved and processed.</p>
  `;
  await sendEmail(to, "ProfitBliss — Withdrawal approved", html);
}
