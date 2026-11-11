import { ui } from "@ada-merkez/copy";
import { Skeleton } from "@ada-merkez/ui";

export function AppRouteSkeleton() {
  return (
    <div className="am-launch-skel" role="status" aria-busy="true" aria-label={ui.loading}>
      <Skeleton kind="title" />
      <Skeleton kind="text" />
      {Array.from({ length: 5 }, (_, index) => (
        <div className="am-launch-skel-row" key={index}>
          <Skeleton kind="avatar" className="am-launch-skel-av" />
          <div className="am-launch-skel-copy">
            <Skeleton kind="text" />
            <Skeleton kind="text" />
          </div>
        </div>
      ))}
    </div>
  );
}
