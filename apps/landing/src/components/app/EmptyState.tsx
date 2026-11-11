import { emptyState } from "@ada-merkez/copy";

export type EmptyStateKind = keyof typeof emptyState;

export function EmptyState({
  kind,
  title,
  body,
}: {
  kind: EmptyStateKind;
  title?: string;
  body?: string;
}) {
  const item = emptyState[kind];
  const src = `/app/bos-durum/${kind}.webp`;
  const src2x = `/app/bos-durum/${kind}@2x.webp`;
  return (
    <div className="am-empty">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="am-empty-art"
        src={src}
        srcSet={`${src} 320w, ${src2x} 640w`}
        sizes="320px"
        width={320}
        height={320}
        alt={item.alt}
        loading="lazy"
        decoding="async"
      />
      <h2>{title ?? item.title}</h2>
      <p className="t-sm t-muted">{body ?? item.body}</p>
    </div>
  );
}
