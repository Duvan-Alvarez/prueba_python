import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : NaN;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || Number.isNaN(port) || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

export async function sendCandidateLinkEmail(email: string, link: string): Promise<void> {
  const config = getEmailConfig();
  if (!config) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in .env');
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: 'Accede a tu prueba técnica',
    text: `Hola,

Se ha creado tu prueba técnica. Accede usando el enlace a continuación:

${link}

Si no solicitaste esta prueba, ignora este correo.
`,
    html: `
      <p>Hola,</p>
      <p>Se ha creado tu prueba técnica. Accede usando el enlace a continuación:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no solicitaste esta prueba, ignora este correo.</p>
    `,
  });
}
