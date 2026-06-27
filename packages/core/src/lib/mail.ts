import nodemailer from "nodemailer"

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })
}

const FROM = process.env.SMTP_FROM || "NovaCV <noreply@novacv.app>"

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const transporter = createTransport()

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your NovaCV password",
    text: `Click the link below to reset your password. It expires in 1 hour.\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#555">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset password
        </a>
        <p style="color:#999;font-size:13px">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:24px"/>
        <p style="color:#bbb;font-size:12px">NovaCV · Your data, your infrastructure</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const transporter = createTransport()

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Welcome to NovaCV",
    text: `Hi ${name || "there"},\n\nWelcome to NovaCV! Start building your resume at ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Welcome to NovaCV 👋</h2>
        <p style="color:#555">Hi ${name || "there"},<br/>Your account is ready. Start building a standout resume in minutes.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Go to dashboard
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin-top:24px"/>
        <p style="color:#bbb;font-size:12px">NovaCV · Your data, your infrastructure</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(to: string, verificationLink: string) {
  const transporter = createTransport()

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your email address - NovaCV",
    text: `Please verify your email address by clicking the link below. This link expires in 24 hours.\n\n${verificationLink}\n\nIf you didn't create an account, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Verify your email address</h2>
        <p style="color:#555">Thanks for joining NovaCV! Please click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${verificationLink}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Verify email
        </a>
        <p style="color:#999;font-size:13px">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:24px"/>
        <p style="color:#bbb;font-size:12px">NovaCV · Your data, your infrastructure</p>
      </div>
    `,
  })
}
