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

const views = new Map(); // id -> { embed, view }

async function loadSpec(base, file) {
  const res = await fetch(base + file + bust);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function tuneSpec(spec, el) {
  spec.width = "container";
  spec.autosize = { type: "fit", contains: "padding" };
  spec.config = {
    ...(spec.config || {}),
    axis:   { ...(spec.config?.axis || {}),   labelFont: "Open Sans", titleFont: "Open Sans", labelFontSize: 12, titleFontSize: 13 },
    legend: { ...(spec.config?.legend || {}), labelFont: "Open Sans", titleFont: "Open Sans", labelFontSize: 12, titleFontSize: 13 },
    title:  { ...(spec.config?.title || {}),  font: "Open Sans", fontSize: 18, fontWeight: 600 }
  };
  return spec;
}

async function embedOne(id, file) {
  const el = document.querySelector(id);
  if (!el) return;

  const cached = views.get(id);
  if (cached) {
    try { await cached.view.resize(); } catch {}
    return cached;
  }

  let spec;
  try { spec = await loadSpec(LOCAL_BASE, file); }
  catch { spec = await loadSpec(REMOTE_BASE, file); }

  const tuned = tuneSpec(spec, el);

  const result = await vegaEmbed(id, tuned, { actions: false, renderer: "canvas" });
  views.set(id, { embed: result, view: result.view });
  return result;
}

async function embedAll() {
  for (const [id, file] of charts) await embedOne(id, file);
}

embedAll();