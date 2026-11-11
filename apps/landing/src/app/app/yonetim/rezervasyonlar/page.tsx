import { requireYonetimPanel } from "../guard";
import { RezervasyonlarView } from "./view";

export const dynamic = "force-dynamic";

export default async function RezervasyonlarPage() {
  await requireYonetimPanel("/app/yonetim/rezervasyonlar");
  return <RezervasyonlarView />;
}
