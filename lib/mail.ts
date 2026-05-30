import nodemailer from "nodemailer";

/**
 * Utility email terpusat untuk Cleanova Shop (Nodemailer + Gmail SMTP).
 * Reusable di webhook Midtrans maupun server action admin.
 */

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

type SendResult = { success: boolean; messageId?: string; error?: unknown };

/**
 * Low-level helper — kirim email HTML. Tidak melempar error (best-effort),
 * supaya kegagalan email tidak menggagalkan transaksi/aksi utama.
 */
export async function sendMail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!to) {
    // eslint-disable-next-line no-console
    console.warn("[mail] dilewati: alamat email kosong.");
    return { success: false, error: "no recipient" };
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.warn("[mail] dilewati: SMTP_USER/SMTP_PASS belum diset.");
    return { success: false, error: "smtp not configured" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"Cleanova Shop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[mail] gagal mengirim:", error);
    return { success: false, error };
  }
}

/* ----------------------- Templates ----------------------- */

function baseLayout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #fafaf9; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5;">
    <div style="background-color: #0c0a09; padding: 28px; text-align: center; border-bottom: 4px solid #d97706;">
      <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 300;">Cleanova <i style="color: #f59e0b; font-weight: 500;">Shop</i></h1>
    </div>
    <div style="padding: 30px; background-color: #ffffff;">
      <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="background-color: #f5f5f4; padding: 18px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="font-size: 12px; color: #78716c; margin: 0;">&copy; ${new Date().getFullYear()} Cleanova Circle. Hak Cipta Dilindungi.</p>
    </div>
  </div>`;
}

export type InvoiceItem = {
  name: string;
  price: number;
  quantity: number;
};

export type InvoiceData = {
  orderId: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  shippingAddress?: string;
};

/**
 * Email invoice — dikirim saat pembayaran lunas (PAID).
 */
export async function sendInvoiceEmail(to: string, data: InvoiceData): Promise<SendResult> {
  const rows = data.items
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0efed; font-size: 14px;">${it.name}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0efed; font-size: 14px; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0efed; font-size: 14px; text-align: right;">${formatRupiah(it.price)}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0efed; font-size: 14px; text-align: right; font-weight: 600;">${formatRupiah(it.price * it.quantity)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="font-size: 15px;">Halo <strong>${data.customerName}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6; color: #444;">
      Pembayaran Anda telah <strong style="color:#16a34a;">berhasil kami terima</strong>. Berikut rincian pesanan Anda:
    </p>
    <p style="font-size: 12px; color: #78716c; margin: 4px 0 16px;">Order ID: <span style="font-family: monospace;">${data.orderId}</span></p>

    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
      <thead>
        <tr style="background-color: #fafaf9;">
          <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 2px solid #e7e5e4;">Produk</th>
          <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 2px solid #e7e5e4;">Qty</th>
          <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 2px solid #e7e5e4;">Harga</th>
          <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 2px solid #e7e5e4;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 14px 8px; text-align: right; font-size: 15px; font-weight: 700;">Total Belanja</td>
          <td style="padding: 14px 8px; text-align: right; font-size: 16px; font-weight: 700; color: #d97706;">${formatRupiah(data.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>

    ${
      data.shippingAddress
        ? `<div style="background-color:#fff7ed; border:1px solid #fed7aa; padding:14px 16px; border-radius:8px; margin-top:18px;">
            <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#9a3412; font-weight:700;">Alamat Pengiriman</p>
            <p style="margin:6px 0 0; font-size:14px; color:#444; line-height:1.5;">${data.shippingAddress}</p>
          </div>`
        : ""
    }

    <p style="font-size: 14px; line-height: 1.6; color: #444; margin-top: 20px;">
      Pesanan Anda otomatis masuk tahap <strong>Dikemas 📦</strong>. Kami akan segera memprosesnya. Anda akan menerima update via email setiap kali status pesanan berubah.
    </p>
  `;

  return sendMail(to, `Invoice Pesanan #${data.orderId.slice(0, 8)} — Cleanova Shop`, baseLayout("Pembayaran Berhasil", body));
}

type StatusKind = "PACKED" | "SHIPPED" | "COMPLETED";

const STATUS_TEMPLATES: Record<StatusKind, { subject: string; title: string; message: string; emoji: string }> = {
  PACKED: {
    subject: "Pesanan Anda Sedang Dikemas",
    title: "Pesanan Sedang Dikemas 📦",
    message: "Kabar baik! Pesanan Anda sedang kami kemas dengan hati-hati dan akan segera kami kirimkan.",
    emoji: "📦",
  },
  SHIPPED: {
    subject: "Pesanan Anda Sedang Dalam Perjalanan",
    title: "Pesanan Dalam Perjalanan 🚚",
    message: "Pesanan Anda telah kami serahkan ke kurir dan sedang dalam perjalanan menuju alamat Anda.",
    emoji: "🚚",
  },
  COMPLETED: {
    subject: "Pesanan Telah Sampai — Terima Kasih!",
    title: "Pesanan Selesai ✅",
    message: "Pesanan Anda telah sampai di tujuan. Terima kasih telah berbelanja di Cleanova Shop. Semoga Anda puas dengan produk kami!",
    emoji: "✅",
  },
};

/**
 * Email update status fulfillment (PACKED / SHIPPED / COMPLETED).
 */
export async function sendOrderStatusEmail(
  to: string,
  status: StatusKind,
  opts: { orderId: string; customerName: string; trackingNumber?: string | null }
): Promise<SendResult> {
  const tpl = STATUS_TEMPLATES[status];

  // Khusus SHIPPED: tampilkan nomor resi kalau tersedia.
  const trackingBlock =
    status === "SHIPPED" && opts.trackingNumber
      ? `<div style="background-color:#eff6ff; border:1px solid #bfdbfe; padding:14px 16px; border-radius:8px; margin:18px 0;">
          <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#1e40af; font-weight:700;">Nomor Resi Anda</p>
          <p style="margin:6px 0 0; font-size:18px; font-family: monospace; font-weight:700; color:#1e3a8a; letter-spacing:1px;">${opts.trackingNumber}</p>
          <p style="margin:6px 0 0; font-size:12px; color:#3b82f6;">Gunakan nomor resi ini untuk melacak paket Anda di situs kurir.</p>
        </div>`
      : "";

  const body = `
    <p style="font-size: 15px;">Halo <strong>${opts.customerName}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6; color: #444;">${tpl.message}</p>
    ${trackingBlock}
    <div style="background-color:#fafaf9; border:1px solid #e7e5e4; padding:14px 16px; border-radius:8px; margin:18px 0;">
      <p style="margin:0; font-size:13px; color:#78716c;">Order ID</p>
      <p style="margin:4px 0 0; font-size:14px; font-family: monospace; color:#1c1917;">${opts.orderId}</p>
    </div>
    <p style="font-size: 13px; color: #78716c; line-height: 1.6;">
      Butuh bantuan? Balas email ini dan tim kami akan membantu Anda.
    </p>
  `;
  return sendMail(to, `${tpl.subject} — Cleanova Shop`, baseLayout(tpl.title, body));
}
