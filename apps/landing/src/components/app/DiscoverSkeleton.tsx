import { ui } from "@ada-merkez/copy";

export function DiscoverSkeleton() {
  return (
    <div className="am-skel-feed" role="status" aria-busy="true" aria-live="polite" aria-label={ui.loading}>
      <div className="am-greet">
        <div className="am-skel" style={{ width: 104, height: 104, borderRadius: "50%", flexShrink: 0 }} />
        <div className="am-balloon">
          <div className="am-skel am-skel-line" />
          <div className="am-skel am-skel-line mt-2" style={{ width: "55%" }} />
        </div>
      </div>
      <div className="am-skel" style={{ height: 48, borderRadius: 14 }} />
      <div className="am-chips">
        <div className="am-skel" style={{ height: 40, width: 72, borderRadius: 999 }} />
        <div className="am-skel" style={{ height: 40, width: 96, borderRadius: 999 }} />
        <div className="am-skel" style={{ height: 40, width: 88, borderRadius: 999 }} />
        <div className="am-skel" style={{ height: 40, width: 80, borderRadius: 999 }} />
      </div>
      <div className="am-sec">
        <div className="am-skel am-skel-title" style={{ width: 140 }} />
      </div>
      <div className="am-hscroll">
        <article className="am-biz" style={{ pointerEvents: "none" }}>
          <div className="am-skel am-skel-photo" />
          <div className="am-biz-body">
            <div className="am-skel am-skel-title" />
            <div className="am-skel am-skel-line mt-2" style={{ width: "70%" }} />
            <div className="am-skel am-skel-line mt-3" style={{ width: "40%", height: 24, borderRadius: 999 }} />
          </div>
        </article>
        <article className="am-biz" style={{ pointerEvents: "none" }}>
          <div className="am-skel am-skel-photo" />
          <div className="am-biz-body">
            <div className="am-skel am-skel-title" />
            <div className="am-skel am-skel-line mt-2" style={{ width: "70%" }} />
            <div className="am-skel am-skel-line mt-3" style={{ width: "40%", height: 24, borderRadius: 999 }} />
          </div>
        </article>
      </div>
    </div>
  );
}
