const LOCAL_BASE  = "./specs/";
const REMOTE_BASE = "https://raw.githubusercontent.com/shandisss/FIT_3179_A2/refs/heads/main/specs/";
const bust = `?v=${Date.now()}`; 

const charts = [
  ["#viz-s1", "section_1.vg.json"],
  ["#viz-s2", "section_2.vg.json"],
  ["#viz-s3", "section_3.vg.json"],
  ["#viz-s4", "section_4.vg.json"],
  ["#viz-s5", "section_5.vg.json"],
  ["#viz-s6", "section_6.vg.json"], 
  ["#viz-s7", "section_7.vg.json"],
  ["#viz-s8", "section_8.vg.json"]
];

async function loadSpec(base, file) {
  const res = await fetch(base + file + bust);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// deep-merge helper for config sub-objects so we don’t clobber nested keys
function mergeConfig(target = {}, extra = {}) {
  return {
    ...target,
    axis:   { ...(target.axis   || {}), ...(extra.axis   || {}) },
    legend: { ...(target.legend || {}), ...(extra.legend || {}) },
    header: { ...(target.header || {}), ...(extra.header || {}) },
    title:  { ...(target.title  || {}), ...(extra.title  || {}) }
  };
}

// Apply responsive typography + sizes without overwriting author intent
function tuneSpec(spec, containerEl) {
  const w = containerEl.clientWidth;
  const small = w < 720;

  const baseConfig = {
    axis:   { labelFontSize: small ? 10 : 12, titleFontSize: small ? 11 : 13 },
    legend: { labelFontSize: small ? 10 : 12, titleFontSize: small ? 11 : 13},
    header: { labelFontSize: small ? 12 : 13, titleFontSize: small ? 13 : 14 },
    title:  { fontSize: small ? 16 : 18, subtitleFontSize: small ? 12 : 13 }
  };
  spec.config = mergeConfig(spec.config, baseConfig);

  spec.autosize = { ...(spec.autosize || {}), type: "fit", contains: "padding", resize: true };

  if (spec.facet && spec.spec) {
    if (spec.spec.width === undefined || spec.spec.width === "container") {
      spec.spec.width = small ? 300 : 360;
    }
    if (spec.spec.height === undefined) {
      spec.spec.height = small ? 200 : 230;
    }
  } else {
    if (spec.width === undefined) spec.width = "container";
    if (spec.height === undefined) spec.height = small ? 360 : 420;
  }

  return spec;
}

async function embedOne(id, file) {
  const el = document.querySelector(id);
  if (!el) return;

  let spec;
  try {
    // Try local first
    spec = await loadSpec(LOCAL_BASE, file);
  } catch {
    // Fallback to remote
    spec = await loadSpec(REMOTE_BASE, file);
  }

  const tuned = tuneSpec(spec, el);
  return vegaEmbed(id, tuned, { actions: false, renderer: "svg" });
}

async function embedAll() {
  await Promise.all(charts.map(([id, file]) => embedOne(id, file)));
}

// Initial render
embedAll();

let raf;
window.addEventListener("resize", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(embedAll);
});
