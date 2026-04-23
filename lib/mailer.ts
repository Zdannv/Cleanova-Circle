import nodemailer from "nodemailer";

interface SendConfirmationEmailParams {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export async function sendConfirmationEmail({ name, email, phone, password }: SendConfirmationEmailParams) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const loginUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/login` : "http://localhost:3000/login";

    const mailOptions = {
      from: `"Cleanova Circle" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Selamat Datang di Cleanova Circle - Akses Pustaka Premium",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; background-color: #fafaf9; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5; display: block;">
          <div style="background-color: #0c0a09; padding: 30px; text-align: center; border-bottom: 4px solid #d97706;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 300;">Cleanova <i style="color: #f59e0b; font-weight: 500;">Circle</i></h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              Terima kasih telah bergabung bersama komunitas eksklusif <strong>Cleanova Circle</strong>. Akun keanggotaan Anda telah berhasil kami daftarkan dan sekarang siap digunakan.
            </p>
            
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #9a3412; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Kredensial Login Anda:</h3>
              <p style="margin: 10px 0; font-size: 15px;"><strong>Nomor Telepon:</strong> ${phone}</p>
              ${password ? `<p style="margin: 10px 0; font-size: 15px;"><strong>Password:</strong> ${password}</p>` : `<p style="margin: 10px 0; font-size: 15px;"><strong>Password:</strong> (Menggunakan password default admin)</p>`}
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 20px;">
              Dengan akun ini, Anda kini memiliki akses penuh ke ratusan panduan video langkah-demi-langkah, trik DIY, serta rekomendasi produk perawatan terbaik untuk koleksi perhiasan Anda.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #d97706; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Masuk ke Dashboard Sekarang</a>
            </div>
          </div>
          
          <div style="background-color: #f5f5f4; padding: 20px; text-align: center; border-top: 1px solid #e7e5e4;">
            <p style="font-size: 12px; color: #78716c; margin: 0;">
              &copy; ${new Date().getFullYear()} Cleanova Circle. Hak Cipta Dilindungi.
            </p>
            <p style="font-size: 12px; color: #78716c; margin: 10px 0 0 0;">
              Jika Anda mengalami masalah saat login, silakan hubungi tim Admin kami.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error };
  }
}
