"use client";

import { useEffect, useMemo, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { fetchUsers, type AdminUser } from "../../../../lib/yonetim-api";

type RoleFilter = "all" | "customer" | "business" | "admin";

function roleLabel(role: string) {
  if (role === "customer") return yonetimApp.roleCustomer;
  if (role === "business") return yonetimApp.roleBusiness;
  if (role === "admin") return yonetimApp.roleAdmin;
  return role;
}

function maskPhone(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return "••••";
  return `${trimmed.slice(0, 2)}•••${trimmed.slice(-2)}`;
}

function accountLabel(row: AdminUser) {
  const name = row.displayName?.trim();
  return name ? name : maskPhone(row.phone);
}

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Nicosia",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function KullanicilarView() {
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUsers()
      .then((data) => setRows(data.users))
      .catch(() => {
        setError(true);
        setRows([]);
      });
  }, []);

  const shown = useMemo(() => {
    if (!rows) return [];
    if (filter === "all") return rows;
    return rows.filter((row) => row.role === filter);
  }, [rows, filter]);

  if (error) return <EmptyState kind="hata" />;
  if (!rows) return null;

  return (
    <>
      <div className="am-toolbar">
        {(
          [
            ["all", yonetimApp.filterAll],
            ["customer", yonetimApp.roleCustomer],
            ["business", yonetimApp.roleBusiness],
            ["admin", yonetimApp.roleAdmin],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`am-chip${filter === id ? " am-chip--on" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyUsersTitle} body={yonetimApp.emptyUsersBody} />
      ) : (
        <section className="am-panel-card">
          <h2>{yonetimApp.usersTitle}</h2>
          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>{yonetimApp.colAccount}</th>
                  <th>{yonetimApp.colRole}</th>
                  <th>{yonetimApp.colRegistered}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={row.id}>
                    <td data-th={yonetimApp.colAccount}>{accountLabel(row)}</td>
                    <td data-th={yonetimApp.colRole}>{roleLabel(row.role)}</td>
                    <td data-th={yonetimApp.colRegistered}>{shortDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
