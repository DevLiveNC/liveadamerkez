import { requireYonetimPanel } from "../guard";
import { KullanicilarView } from "./view";

export const dynamic = "force-dynamic";

export default async function KullanicilarPage() {
  await requireYonetimPanel("/app/yonetim/kullanicilar");
  return <KullanicilarView />;
}
