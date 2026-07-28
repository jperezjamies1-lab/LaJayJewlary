import { Resend } from "resend";

/**
 * Transactional email. Uses Resend (set RESEND_API_KEY). Code-complete and
 * correct against Resend's API; unverified against a live send in this
 * sandbox since there's no network egress to Resend here.
 */
function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — cannot send email.");
  }
  return new Resend(apiKey);
}

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const from = process.env.EMAIL_FROM ?? "Jay La Joyería <no-reply@jaylajoyeria.com>";
  const resend = getClient();
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
}

export function verificationEmail(locale: "en" | "es", verifyUrl: string) {
  const t =
    locale === "es"
      ? {
          subject: "Verifica tu correo — Jay La Joyería",
          heading: "Verifica tu correo electrónico",
          body: "Gracias por crear tu cuenta. Haz clic en el botón para verificar tu correo.",
          cta: "Verificar correo",
        }
      : {
          subject: "Verify your email — Jay La Joyería",
          heading: "Verify your email",
          body: "Thanks for creating an account. Click the button below to verify your email.",
          cta: "Verify Email",
        };

  return {
    subject: t.subject,
    html: emailShell(t.heading, `<p>${t.body}</p><p><a href="${verifyUrl}" style="background:#D4AF37;color:#0A0A0A;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">${t.cta}</a></p>`),
  };
}

export function passwordResetEmail(locale: "en" | "es", resetUrl: string) {
  const t =
    locale === "es"
      ? {
          subject: "Restablece tu contraseña — Jay La Joyería",
          heading: "Restablece tu contraseña",
          body: "Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.",
          cta: "Restablecer contraseña",
        }
      : {
          subject: "Reset your password — Jay La Joyería",
          heading: "Reset your password",
          body: "We received a request to reset your password. This link expires in 1 hour.",
          cta: "Reset Password",
        };

  return {
    subject: t.subject,
    html: emailShell(t.heading, `<p>${t.body}</p><p><a href="${resetUrl}" style="background:#D4AF37;color:#0A0A0A;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">${t.cta}</a></p>`),
  };
}

export function orderConfirmationEmail(
  locale: "en" | "es",
  order: { orderNumber: string; total: number; zellePhone: string }
) {
  const t =
    locale === "es"
      ? {
          subject: `Pedido recibido — ${order.orderNumber}`,
          heading: "¡Gracias por tu pedido!",
          body: `Tu pedido <strong>${order.orderNumber}</strong> por <strong>$${order.total}</strong> ha sido recibido. Para completarlo, envía el pago por Zelle a <strong>${order.zellePhone}</strong> y sube tu comprobante desde tu cuenta.`,
        }
      : {
          subject: `Order received — ${order.orderNumber}`,
          heading: "Thank you for your order!",
          body: `Your order <strong>${order.orderNumber}</strong> for <strong>$${order.total}</strong> has been received. To complete it, send payment via Zelle to <strong>${order.zellePhone}</strong> and upload your payment screenshot from your account.`,
        };

  return { subject: t.subject, html: emailShell(t.heading, `<p>${t.body}</p>`) };
}

export function welcomeEmail(locale: "en" | "es", name: string) {
  const t =
    locale === "es"
      ? {
          subject: "Bienvenido a Jay La Joyería",
          heading: `Bienvenido, ${name}`,
          body: "Tu cuenta ha sido creada. Explora nuestra colección y descubre piezas hechas para durar toda la vida.",
        }
      : {
          subject: "Welcome to Jay La Joyería",
          heading: `Welcome, ${name}`,
          body: "Your account has been created. Explore our collection and discover pieces made to last a lifetime.",
        };
  return { subject: t.subject, html: emailShell(t.heading, `<p>${t.body}</p>`) };
}

export function paymentReceivedEmail(locale: "en" | "es", orderNumber: string) {
  const t =
    locale === "es"
      ? {
          subject: `Pago verificado — ${orderNumber}`,
          heading: "¡Tu pago fue verificado!",
          body: `Tu pedido <strong>${orderNumber}</strong> ha sido confirmado y pasa a preparación. Te avisaremos cuando sea enviado.`,
        }
      : {
          subject: `Payment verified — ${orderNumber}`,
          heading: "Your payment was verified!",
          body: `Your order <strong>${orderNumber}</strong> is confirmed and moving to processing. We'll let you know once it ships.`,
        };
  return { subject: t.subject, html: emailShell(t.heading, `<p>${t.body}</p>`) };
}

export function orderShippedEmail(locale: "en" | "es", orderNumber: string, trackingNumber: string) {
  const t =
    locale === "es"
      ? {
          subject: `Tu pedido fue enviado — ${orderNumber}`,
          heading: "¡Tu pedido está en camino!",
          body: `Pedido <strong>${orderNumber}</strong>. Número de rastreo: <strong>${trackingNumber}</strong>.`,
        }
      : {
          subject: `Your order has shipped — ${orderNumber}`,
          heading: "Your order is on its way!",
          body: `Order <strong>${orderNumber}</strong>. Tracking number: <strong>${trackingNumber}</strong>.`,
        };
  return { subject: t.subject, html: emailShell(t.heading, `<p>${t.body}</p>`) };
}

function emailShell(heading: string, bodyHtml: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jaylajoyeria.com";
  return `<!DOCTYPE html>
<html>
  <body style="font-family:Helvetica,Arial,sans-serif;background:#0A0A0A;padding:40px;">
    <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;color:#FDFDFD;">
      <img src="${siteUrl}/branding/logo-header.png" alt="Jay La Joyería" width="140" style="display:block;margin:0 auto 24px;height:auto;" />
      <h1 style="font-size:20px;margin:0 0 16px;text-align:center;">${heading}</h1>
      <div style="font-size:14px;line-height:1.6;color:#FDFDFDaa;">${bodyHtml}</div>
    </div>
  </body>
</html>`;
}
