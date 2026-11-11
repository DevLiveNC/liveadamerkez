import { requireYonetimPanel } from "../guard";
import { IcerikView } from "./view";

export const dynamic = "force-dynamic";

export default async function IcerikPage() {
  await requireYonetimPanel("/app/yonetim/icerik");
  return <IcerikView />;
}
