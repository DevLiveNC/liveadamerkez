import { requireIsletmePanel } from "../guard";
import { HizmetlerView } from "./view";

export default async function HizmetlerPage() {
  await requireIsletmePanel("/app/isletme/hizmetler");
  return <HizmetlerView />;
}
