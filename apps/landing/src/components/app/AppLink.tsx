import Link from "next/link";
import type { LinkLikeProps } from "@ada-merkez/ui";

/** `@ada-merkez/ui` cam bileşenlerine verilen Next bağlantısı.
 *  Böylece paket Next'e bağımlı kalmaz, istemci geçişi korunur. */
export function AppLink({ href, children, ...rest }: LinkLikeProps) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
