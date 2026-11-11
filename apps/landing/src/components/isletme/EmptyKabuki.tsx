import { EmptyState, type EmptyStateKind } from "../app/EmptyState";

export function EmptyKabuki({
  kind,
  title,
  body,
}: {
  kind: EmptyStateKind;
  title?: string;
  body?: string;
}) {
  return <EmptyState kind={kind} title={title} body={body} />;
}
