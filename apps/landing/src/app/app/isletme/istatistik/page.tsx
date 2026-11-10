import { requireIsletmePanel } from "../guard";
import { IstatistikView } from "./view";

export default async function IstatistikPage() {
  await requireIsletmePanel("/app/isletme/istatistik");
  return <IstatistikView />;
}
