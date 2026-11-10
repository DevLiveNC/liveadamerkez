"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { createCategory, fetchCategories, type AdminCategory } from "../../../../lib/yonetim-api";

export function IcerikView() {
  const [rows, setRows] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("service");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setRows(data.categories);
      setError(false);
    } catch {
      setError(true);
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    await createCategory({ name, kind });
    setName("");
    setSaved(true);
    await load();
  }

  if (error) return <EmptyState kind="hata" />;
  if (!rows) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.contentTitle}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.contentTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.contentLead}</p>
      </div>
      <form className="form-card yonetim-form" onSubmit={(e) => void onSubmit(e)} style={{ marginBottom: 20 }}>
        <div className="field">
          <label className="field-label" htmlFor="cat-name">
            {yonetimApp.categoryName}
          </label>
          <input className="input" id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="cat-kind">
            {yonetimApp.categoryKind}
          </label>
          <input className="input" id="cat-kind" value={kind} onChange={(e) => setKind(e.target.value)} required />
        </div>
        <button className="btn btn-navy" type="submit">
          {yonetimApp.addCategory}
        </button>
        {saved ? (
          <p className="t-sm t-muted" style={{ marginTop: 8 }}>
            {yonetimApp.saved}
          </p>
        ) : null}
      </form>
      {rows.length === 0 ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyContentTitle} body={yonetimApp.emptyContentBody} />
      ) : (
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.id} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.name}
              </p>
              <p className="t-xs t-muted">
                {row.slug} · {row.kind}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
