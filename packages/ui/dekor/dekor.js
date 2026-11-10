/* Runtime değil (React: packages/ui/src/dekor/Dekor.tsx). Tasarım arşivi.
   Ada Merkez dekor — KAYNAK: ui/landing/assets/dekor/dekor.js
   Etkinleştirme (html veya body):
     data-dekor="landing" | "app-giris" | "app-musteri" | "app-isletme" | "app-yonetici"
   Hafif paralaks (translate3d + rAF, ±16 px); prefers-reduced-motion kapalı.
   Lazy-load + width/height; hero spriteları fetchpriority=low.
   1×/2× srcset; will-change yalnızca paralaks kaydırmadayken.
*/
(function () {
  var script = document.currentScript || document.querySelector('script[src*="dekor.js"]');
  if (!script) return;

  function assetBase() {
    var src = script.src || "";
    if (src.indexOf("/assets/dekor/") !== -1) return new URL("./", src).href;
    if (src.indexOf("/dekor/") !== -1) return new URL("./", src).href;
    return new URL("../landing/assets/dekor/", src).href;
  }
  var BASE = assetBase();

  var DIM = {
    palmiye: [312, 304],
    "zeytin-dali": [296, 264],
    begonvil: [320, 192],
    "yaprak-kumesi": [264, 204],
    "tarak-kabuk": [200, 174],
    "sarmal-kabuk": [184, 164],
    "deniz-yildizi": [176, 164],
    cakil: [240, 154]
  };

  var SCENES = ["landing", "app-giris", "app-musteri", "app-isletme", "app-yonetici"];

  function sceneOf() {
    var html = document.documentElement;
    var body = document.body;
    var raw = (html.getAttribute("data-dekor") || body.getAttribute("data-dekor") || "").trim();
    if (SCENES.indexOf(raw) !== -1) return raw;

    var path = (location.pathname || "").replace(/\\/g, "/");
    if (body.classList.contains("landing")) return "landing";
    if (body.classList.contains("form-page")) return "app-giris";
    if (path.indexOf("/app/giris") !== -1 || path.indexOf("/app/login") !== -1) return "app-giris";
    if (path.indexOf("/app/musteri") !== -1 || path.indexOf("/musteri/") !== -1) return "app-musteri";
    if (path.indexOf("/app/isletme") !== -1 || path.indexOf("/isletme/") !== -1) return "app-isletme";
    if (path.indexOf("/app/yonetici") !== -1 || path.indexOf("/app/yonetim") !== -1 || path.indexOf("/yonetim/") !== -1) return "app-yonetici";
    return "none";
  }

  function sprite(name, cls, parallax, opts) {
    opts = opts || {};
    var d = DIM[name];
    var loading = opts.eager ? ' fetchpriority="low"' : ' loading="lazy"';
    var extra = opts.deskOnly ? " am-dekor--desk-only" : "";
    var src2x = BASE + "webp/" + name + ".webp";
    var src1x = BASE + "webp/" + name + "-m.webp";
    return (
      '<div class="am-dekor-item ' + cls + extra + '" data-parallax="' + parallax + '" aria-hidden="true">' +
        "<picture>" +
          '<source media="(max-width: 860px)" type="image/webp" srcset="' + src1x + " 1x, " + src2x + ' 2x">' +
          '<source type="image/webp" srcset="' + src2x + ' 2x">' +
          '<img data-am-dekor-sprite="" src="' + src2x + '" alt="" width="' + d[0] + '" height="' + d[1] + '" decoding="async"' + loading + ">" +
        "</picture>" +
      "</div>"
    );
  }

  function svgImg(file, cls, w, h, parallax) {
    return (
      '<div class="am-dekor-svg ' + cls + '" data-parallax="' + (parallax || "0") + '" aria-hidden="true">' +
        '<img src="' + BASE + "svg/" + file + '" alt="" width="' + w + '" height="' + h + '" decoding="async">' +
      "</div>"
    );
  }

  function band(kind, inner) {
    return '<div class="am-dekor-band am-dekor-band--' + kind + '" aria-hidden="true">' + inner + "</div>";
  }

  function insertAfter(sel, html) {
    var el = document.querySelector(sel);
    if (el) el.insertAdjacentHTML("afterend", html);
  }

  function placeLanding() {
    var hero = document.querySelector("section.hero");
    if (hero) {
      var layer = document.createElement("div");
      layer.className = "am-dekor-layer";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML =
        sprite("tarak-kabuk", "am-dekor--tarak", "0.08", { eager: true }) +
        sprite("sarmal-kabuk", "am-dekor--sarmal", "0.06", { eager: true, deskOnly: true }) +
        sprite("cakil", "am-dekor--cakil", "0.05", { eager: true, deskOnly: true }) +
        sprite("begonvil", "am-dekor--begonvil", "0.07", { eager: true, deskOnly: true }) +
        sprite("palmiye", "am-dekor--palmiye", "0.1", { eager: true });
      hero.insertBefore(layer, hero.firstChild);
    }
    insertAfter("section.search-band", band("foam", svgImg("kopuk.svg", "am-dekor--kopuk", 1440, 64, "0.04")));
    insertAfter("section#ornekler", band("wave", svgImg("dalga-kenar.svg", "am-dekor--dalga", 1440, 72, "0.04")));
    insertAfter(
      "section#etkinlik",
      band(
        "tracks",
        svgImg("ayak-izi.svg", "am-dekor--ayak-izi-svg", 260, 48, "0.05") +
          sprite("deniz-yildizi", "am-dekor--yildiz", "0.08", { deskOnly: true })
      )
    );
    var nasil = document.querySelector("section#nasil");
    if (nasil) nasil.insertAdjacentHTML("afterbegin", sprite("zeytin-dali", "am-dekor--zeytin", "0.07", { deskOnly: true }));
    insertAfter("section#whatsapp", band("wave", svgImg("dalga-kenar.svg", "am-dekor--dalga", 1440, 72, "0.04")));
    var araclar = document.querySelector("section#araclar");
    if (araclar) {
      araclar.insertAdjacentHTML("afterbegin", sprite("yaprak-kumesi", "am-dekor--yaprak", "0.06", { deskOnly: true }));
    }
    insertAfter("section#pilot", band("foam", svgImg("kopuk.svg", "am-dekor--kopuk", 1440, 64, "0.03")));
  }

  function placeGiris() {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="am-dekor-layer" aria-hidden="true" style="position:fixed;inset:0;z-index:0">' +
        sprite("tarak-kabuk", "am-dekor--tarak", "0.05", { deskOnly: true }) +
        sprite("palmiye", "am-dekor--palmiye", "0.07") +
      "</div>"
    );
    var main = document.querySelector("main");
    if (main) {
      main.insertAdjacentHTML("beforeend", band("wave", svgImg("dalga-kenar.svg", "am-dekor--dalga", 1440, 72, "0")));
    }
    var nav = document.querySelector("header.nav, .nav");
    if (nav) nav.style.zIndex = "40";
    var wrap = document.querySelector("main .wrap, .form-hero .wrap");
    if (wrap) wrap.style.zIndex = "1";
  }

  function placePanel(kind) {
    document.body.classList.add("am-dekor-scene-" + kind);
    var html = band("wave", svgImg("dalga-kenar.svg", "am-dekor--dalga", 1440, 72, "0"));
    var nav = document.querySelector(".side-nav");
    if ((kind === "app-isletme" || kind === "app-yonetici") && nav) {
      nav.insertAdjacentHTML(
        "beforeend",
        '<div class="am-dekor-nav-corner am-dekor--desk-only" aria-hidden="true">' +
          sprite("yaprak-kumesi", "am-dekor--yaprak", "0.04", { deskOnly: true }) +
        "</div>"
      );
    }
    if (kind === "app-musteri") {
      html += sprite("sarmal-kabuk", "am-dekor--sarmal", "0.04", { deskOnly: true });
    }
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function bindParallax() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!els.length) return;
    var ticking = false;
    var idle = 0;
    function clearWillChange() {
      els.forEach(function (el) {
        el.style.willChange = "";
      });
    }
    function apply(parallaxActive) {
      ticking = false;
      if (reduce.matches) {
        els.forEach(function (el) {
          el.style.transform = "";
          el.style.willChange = "";
        });
        return;
      }
      var vh = window.innerHeight || 800;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax") || "0");
        if (!speed || el.offsetParent === null) {
          el.style.willChange = "";
          return;
        }
        el.style.willChange = parallaxActive ? "transform" : "";
        var r = el.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        if (offset > 16) offset = 16;
        if (offset < -16) offset = -16;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          apply(true);
          window.clearTimeout(idle);
          idle = window.setTimeout(clearWillChange, 180);
        });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (reduce.addEventListener) reduce.addEventListener("change", function () { apply(false); });
    apply(false);
  }

  var scene = sceneOf();
  if (scene !== "none") {
    if (!document.documentElement.getAttribute("data-dekor")) {
      document.documentElement.setAttribute("data-dekor", scene);
    }
    if (!document.body.getAttribute("data-dekor")) {
      document.body.setAttribute("data-dekor", scene);
    }
  }
  if (scene === "landing") placeLanding();
  else if (scene === "app-giris") placeGiris();
  else if (scene === "app-musteri" || scene === "app-isletme" || scene === "app-yonetici") placePanel(scene);
  bindParallax();
})();
