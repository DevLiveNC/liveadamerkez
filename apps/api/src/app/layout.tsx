import type { ReactNode } from "react";

export const metadata = {
  title: "Ada Merkez API",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
