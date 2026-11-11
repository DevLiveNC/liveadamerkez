import { requireYonetimPanel } from "../guard";
import { SistemDurumuView } from "./view";

export const dynamic = "force-dynamic";

export default async function SistemDurumuPage() {
  await requireYonetimPanel("/app/yonetim/sistem-durumu");
  return <SistemDurumuView />;
}
