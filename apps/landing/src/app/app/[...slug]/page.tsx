import { notFound } from "next/navigation";

/** /app altında eşleşmeyen yol: kabuk içindeki 404 sınırına devredilir.
 *  Next, eşleşmeyen URL'lerde kök not-found'u kullanır; bu yakalayıcı
 *  müşteri kabuğunun kendi boş durumunu göstermesini sağlar. */
export default async function AppCatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  await params;
  notFound();
}
