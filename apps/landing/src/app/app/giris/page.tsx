import { redirect } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { parseAppRoleParam, readNextParam } from "@ada-merkez/shared";
import { GirisForm } from "../../../components/app/GirisForm";
import { getSession } from "../../../lib/app-auth";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; kayit?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = readNextParam(new URLSearchParams({ next: params.next ?? "" }));
  const session = await getSession();
  if (session) redirect(next);
  const role = parseAppRoleParam(params.rol);
  const register = params.kayit === "1" && role !== "admin";

  return (
    <>
      <header className="am-head">
        <p className="t-label">{app.kicker}</p>
        <h1>{register ? app.signUp : app.signIn}</h1>
        <p className="am-note">{app.nextHint}</p>
      </header>
      <GirisForm defaultRole={role} registerDefault={register} nextPath={next} />
    </>
  );
}
