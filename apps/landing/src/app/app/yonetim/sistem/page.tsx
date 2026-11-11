import { requireYonetimPanel } from "../guard";
import { SistemView } from "./view";

export const dynamic = "force-dynamic";

export default async function SistemPage() {
  await requireYonetimPanel("/app/yonetim/sistem");
  return <SistemView />;
}
