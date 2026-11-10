import { waitlist } from "@ada-merkez/copy";
import { WaitlistForm } from "../../components/WaitlistForm";

export const metadata = {
  title: `${waitlist.title} — Ada Merkez`,
  description: waitlist.lede,
};

export default function WaitlistPage() {
  return (
    <main id="icerik" className="form-hero">
      <WaitlistForm />
    </main>
  );
}
