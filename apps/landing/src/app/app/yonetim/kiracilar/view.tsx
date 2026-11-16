"use client";

import { useCallback } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import { DirectoryView } from "../../../../components/yonetim/DirectoryView";
import { fetchBusinesses } from "../../../../lib/yonetim-api";

export function KiracilarView() {
  const loader = useCallback(async () => {
    const data = await fetchBusinesses();
    return data.businesses.map((row) => ({
      id: row.id,
      name: row.name,
      meta: `${row.inTurkey ? panel.turkey : (row.cityName ?? "—")} · ${row.categoryName ?? row.sector ?? "—"}`,
      status: row.status,
      date: row.createdAt,
      search: row.slug,
    }));
  }, []);
  return (
    <DirectoryView
      title={yonetimApp.tenantsTitle}
      lead={yonetimApp.tenantsLead}
      loader={loader}
      queryKey="admin-tenants"
      emptyTitle={yonetimApp.emptyTenantsTitle}
      emptyBody={yonetimApp.emptyTenantsBody}
      filters={[
        ["all", panel.all],
        ["pending", panel.pending],
        ["approved", panel.confirmed],
        ["rejected", panel.rejectedFilter],
      ]}
    />
  );
}
