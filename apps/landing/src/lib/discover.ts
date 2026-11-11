import { examples } from "@ada-merkez/copy";
import { serverApi } from "./app-api";

export type DiscoverCard = {
  id: string;
  name: string;
  city: string | null;
  category: string | null;
  serviceName: string | null;
  sample: boolean;
  categorySlug?: string | null;
  image?: string | null;
};

const EXAMPLE_CARDS: DiscoverCard[] = examples.cards.map((card, index) => ({
  id: String(index + 1),
  name: card.name,
  city: card.city,
  category: card.category,
  serviceName: card.service,
  sample: true,
  image: card.image,
}));

export function exampleCard(id: string): DiscoverCard | null {
  return EXAMPLE_CARDS.find((card) => card.id === id) ?? null;
}

export async function loadDiscover(filters?: {
  q?: string;
  category?: string;
}): Promise<{ cards: DiscoverCard[]; fromExamples: boolean }> {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);
  if (filters?.category) params.set("category", filters.category);
  const query = params.toString();
  const data = await serverApi<{ ok?: boolean; businesses?: DiscoverCard[] }>(
    `/v1/public/businesses${query ? `?${query}` : ""}`,
  );
  const live = data?.ok && Array.isArray(data.businesses) ? data.businesses : [];
  if (live.length) return { cards: live, fromExamples: false };
  let cards = EXAMPLE_CARDS;
  const q = filters?.q?.trim().toLocaleLowerCase("tr-TR");
  const cat = filters?.category?.trim().toLocaleLowerCase("tr-TR");
  if (q) {
    cards = cards.filter((card) =>
      `${card.name} ${card.city ?? ""} ${card.category ?? ""} ${card.serviceName ?? ""}`
        .toLocaleLowerCase("tr-TR")
        .includes(q),
    );
  }
  if (cat && cat !== "all") {
    cards = cards.filter((card) => {
      const hay = `${card.category ?? ""} ${card.categorySlug ?? ""}`.toLocaleLowerCase("tr-TR");
      if (cat === "kuafor") return hay.includes("kuafor") || hay.includes("kuaför");
      if (cat === "guzellik") return hay.includes("güzellik") || hay.includes("guzellik");
      return hay.includes(cat);
    });
  }
  return { cards, fromExamples: true };
}
