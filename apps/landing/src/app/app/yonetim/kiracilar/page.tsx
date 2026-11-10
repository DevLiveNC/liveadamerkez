import { requireYonetimPanel } from "../guard";
import { KiracilarView } from "./view";

export const dynamic = "force-dynamic";

export default async function KiracilarPage() {
  await requireYonetimPanel("/app/yonetim/kiracilar");
  return <KiracilarView />;
}
