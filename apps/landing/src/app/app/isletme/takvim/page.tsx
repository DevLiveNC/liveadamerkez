import { requireIsletmePanel } from "../guard";
import { TakvimView } from "./view";

export default async function TakvimPage() {
  await requireIsletmePanel("/app/isletme/takvim");
  return <TakvimView />;
}
