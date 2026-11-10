import { requireYonetimPanel } from "../guard";
import { DenetimView } from "./view";

export const dynamic = "force-dynamic";

export default async function DenetimPage() {
  await requireYonetimPanel("/app/yonetim/denetim");
  return <DenetimView />;
}
