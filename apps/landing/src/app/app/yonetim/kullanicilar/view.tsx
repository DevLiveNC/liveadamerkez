"use client";

import { useCallback } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import { DirectoryView } from "../../../../components/yonetim/DirectoryView";
import { fetchUsers } from "../../../../lib/yonetim-api";

export function KullanicilarView() {
  const loader = useCallback(async () => {
    const data = await fetchUsers();
    return data.users.map((row) => ({
      id: row.id,
      name: row.displayName?.trim() || row.phone,
      meta: `${row.phone}${row.displayName ? "" : ""}`,
      status: row.role,
      date: row.createdAt,
      search: row.email ?? "",
    }));
  }, []);
  return (
    <DirectoryView
      title={yonetimApp.usersTitle}
      lead={yonetimApp.usersLead}
      loader={loader}
      queryKey="admin-users"
      emptyTitle={yonetimApp.emptyUsersTitle}
      emptyBody={yonetimApp.emptyUsersBody}
      filters={[
        ["all", panel.all],
        ["customer", yonetimApp.roleCustomer],
        ["business", yonetimApp.roleBusiness],
        ["admin", yonetimApp.roleAdmin],
      ]}
    />
  );
}
