import { redirect } from "next/navigation";
import { parseAppRoleParam, parseAuthModeParam, readNextParam } from "@ada-merkez/shared";
import { GirisForm } from "../../../components/app/GirisForm";
import { getSession } from "../../../lib/app-auth";
import "../../../styles/tokens-v2-local.css";
import "../../../styles/giris-v2.css";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; kayit?: string; mod?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = readNextParam(new URLSearchParams({ next: params.next ?? "" }));
  const session = await getSession();
  if (session) redirect(next);
  const role = parseAppRoleParam(params.rol);
  const mode = parseAuthModeParam(params.mod, params.kayit);

  return <GirisForm defaultRole={role} registerDefault={mode === "register"} nextPath={next} />;
}
