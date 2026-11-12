"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { app } from "@ada-merkez/copy";
import { FormField, TextField } from "@ada-merkez/ui";

export function ProfileNameForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="am-auth"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSaved(false);
        if (name.trim().length < 2) {
          setError(app.invalidName);
          return;
        }
        setBusy(true);
        try {
          const res = await fetch("/app/api/hesap", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
          });
          if (!res.ok) {
            setError(app.authUnavailable);
            return;
          }
          setSaved(true);
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <FormField id="profil-ad" label={app.name} error={error}>
        {({ id, describedBy }) => (
          <TextField
            id={id}
            describedBy={describedBy}
            name="ad"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </FormField>
      {saved ? <p className="am-note">{app.nameSaved}</p> : null}
      <button className="btn btn-coral" type="submit" disabled={busy}>
        {app.saveName}
      </button>
    </form>
  );
}
