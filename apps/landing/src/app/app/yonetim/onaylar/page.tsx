import { requireYonetimPanel } from "../guard";
import { OnaylarView } from "./view";

export const dynamic = "force-dynamic";

export default async function OnaylarPage() {
  await requireYonetimPanel("/app/yonetim/onaylar");
  return <OnaylarView />;
}
