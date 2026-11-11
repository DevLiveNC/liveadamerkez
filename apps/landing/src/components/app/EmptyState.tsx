import { emptyState } from "@ada-merkez/copy";
import { EmptyState as UiEmptyState } from "@ada-merkez/ui";

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
    <UiEmptyState
      title={title ?? item.title}
      body={body ?? item.body}
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="am-empty-art"
          src={src}
          srcSet={`${src} 320w, ${src2x} 640w`}
          sizes="160px"
          width={160}
          height={160}
          alt={item.alt}
          loading="lazy"
          decoding="async"
        />
      }
    />
  );
}
