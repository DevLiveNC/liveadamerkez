import { cx } from "./cx.js";

export type SkeletonKind = "text" | "title" | "avatar" | "block" | "photo";

export function Skeleton({
  kind = "text",
  className,
  label,
}: {
  kind?: SkeletonKind;
  className?: string;
  label?: string;
}) {
  const kindClass =
    kind === "title"
      ? "am-skel-title"
      : kind === "photo"
        ? "am-skel-photo"
        : kind === "block"
          ? "am-skel-photo"
          : "am-skel-line";
  return (
    <span
      className={cx("am-skel", kindClass, className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "status" : undefined}
    />
  );
}

export function SkeletonStack({
  rows = 3,
  label,
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="am-stack" role="status" aria-busy="true" aria-label={label}>
      <Skeleton kind="title" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} kind="text" />
      ))}
      <Skeleton kind="photo" />
    </div>
  );
}
