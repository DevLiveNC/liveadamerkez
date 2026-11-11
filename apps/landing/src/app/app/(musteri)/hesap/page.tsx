import { app } from "@ada-merkez/copy";
import { CikisButton } from "../../../../components/app/CikisButton";
import { ProfileNameForm } from "../../../../components/app/ProfileNameForm";
import { requireRole } from "../../../../lib/app-auth";

export default async function HesapPage() {
  const session = await requireRole("customer", "/app/hesap");
  return (
    <>
      <header className="am-head">
        <h1>{app.account}</h1>
        <p className="am-note">
          {session.name || app.customer} · {session.phone}
        </p>
      </header>
      <p className="am-banner">{app.customer}</p>
      <ProfileNameForm initial={session.name ?? ""} />
      <CikisButton />
    </>
  );
}
