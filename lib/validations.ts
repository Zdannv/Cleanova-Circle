import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi." })
    .trim()
    .min(1, "Nama wajib diisi."),
  email: z
    .string({ error: "Email wajib diisi." })
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z
    .string({ error: "Password wajib diisi." })
    .min(6, "Password minimal 6 karakter."),
  acceptsMarketing: z
    .boolean()
    .default(true),
});

export const BroadcastSchema = z.object({
  subject: z
    .string({ error: "Subjek wajib diisi." })
    .trim()
    .min(1, "Subjek wajib diisi."),
  htmlBody: z
    .string({ error: "Isi pesan wajib diisi." })
    .trim()
    .min(1, "Isi pesan wajib diisi."),
});

