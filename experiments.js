const experimentRows = [
  { name: "Qwen3-VL-2B-Instruct", group: "open-weight", score: 38.90, route: "Fresh inference" },
  { name: "Qwen2.5-VL-3B-Instruct", group: "open-weight", score: 40.61, route: "Fresh inference" },
  { name: "Qwen2.5-VL-7B-Instruct", group: "open-weight", score: 38.66, route: "Fresh inference" },
  { name: "Qwen3-VL-4B-Instruct", group: "open-weight", score: 45.60, route: "Fresh inference" },
  { name: "Qwen3-VL-4B-Thinking", group: "open-weight", score: 46.58, route: "Fresh inference" },
  { name: "Qwen3-VL-8B-Instruct", group: "open-weight", score: 46.34, route: "Fresh inference" },
  { name: "Qwen3-VL-8B-Thinking", group: "open-weight", score: 46.45, route: "Fresh inference" },
  { name: "Qwen3-VL-30B-A3B-Instruct", group: "open-weight", score: 47.06, route: "Configuration reference" },
  { name: "Qwen3-VL-32B-Thinking", group: "open-weight", score: 49.58, route: "Configuration reference" },
  { name: "LLaVA-OneVision-1.5-4B-Instruct", group: "open-weight", score: 43.75, route: "Aggregate score" },
  { name: "LLaVA-OneVision-1.5-8B-Instruct", group: "open-weight", score: 44.30, route: "Aggregate score" },
  { name: "MiniCPM-V-4", group: "open-weight", score: 40.99, route: "Aggregate score" },
  { name: "InternVL3-8B", group: "open-weight", score: 43.56, route: "Fresh inference" },
  { name: "ERNIE-4.5-VL-28B-A3B-Thinking", group: "open-weight", score: 42.06, route: "Aggregate score" },
  { name: "LLaVA-NeXT-Video-7B", group: "open-weight", score: 11.30, route: "Aggregate score" },
  { name: "Spatial-MLLM", group: "open-weight", score: 15.81, route: "Aggregate score" },
  { name: "ViCA2-7B", group: "open-weight", score: 16.45, route: "Aggregate score" },
  { name: "ISI-8B-Instruct", group: "SFT", score: 45.06, route: "Aggregate score" },
  { name: "Escher-7B-Instruct", group: "SFT", score: 48.89, route: "Aggregate score" },
  { name: "Escher-4B-Instruct", group: "SFT", score: 49.49, route: "Aggregate score" },
  { name: "Escher-4B-Thinking", group: "SFT", score: 48.54, route: "Aggregate score" },
  { name: "Escher-8B-Instruct", group: "SFT", score: 49.85, route: "Aggregate score" },
  { name: "Escher-8B-Thinking", group: "SFT", score: 48.79, route: "Aggregate score" },
  { name: "Qwen3-VL-Plus", group: "closed API", score: 44.75, route: "Aggregate score" },
  { name: "GPT-5", group: "closed API", score: 53.24, route: "Aggregate score" },
  { name: "Gemini-2.5-Flash", group: "closed API", score: 52.19, route: "Fresh inference" },
  { name: "Gemini-2.5-Pro", group: "closed API", score: 57.26, route: "Fresh inference" },
  { name: "Human mean", group: "human", score: 90.62, route: "11 annotators" },
];

const chart = document.querySelector("[data-model-chart]");
const filterButtons = [...document.querySelectorAll("[data-experiment-filter]")];
const sortSelect = document.querySelector("[data-experiment-sort]");
const explorerSummary = document.querySelector("[data-explorer-summary]");
let activeExperimentFilter = "all";

const groupLabel = (group) => ({
  "open-weight": "Open-weight",
  "SFT": "Fine-tuned",
  "closed API": "Closed API",
  "human": "Human",
}[group] || group);

const renderExperimentRows = () => {
  if (!chart) return;

  const filtered = experimentRows
    .filter((row) => activeExperimentFilter === "all" || row.group === activeExperimentFilter)
    .sort((a, b) => sortSelect?.value === "name"
      ? a.name.localeCompare(b.name)
      : b.score - a.score);

  chart.replaceChildren(...filtered.map((row) => {
    const item = document.createElement("div");
    item.className = `model-row model-row-${row.group.toLowerCase().replace(/\s+/g, "-")}`;

    const meta = document.createElement("div");
    meta.className = "model-meta";
    const name = document.createElement("strong");
    name.textContent = row.name;
    const details = document.createElement("span");
    details.textContent = `${groupLabel(row.group)} · ${row.route}`;
    meta.append(name, details);

    const track = document.createElement("div");
    track.className = "model-track";
    const bar = document.createElement("i");
    bar.style.setProperty("--score", `${row.score}%`);
    track.append(bar);

    const score = document.createElement("strong");
    score.className = "model-score";
    score.textContent = `${row.score.toFixed(2)}%`;

    item.append(meta, track, score);
    return item;
  }));

  if (explorerSummary) {
    const noun = filtered.length === 1 ? "entry" : "entries";
    explorerSummary.textContent = `Showing ${filtered.length} ${noun} from the public EscherVerse result registry.`;
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeExperimentFilter = button.dataset.experimentFilter;
    filterButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    renderExperimentRows();
  });
});

sortSelect?.addEventListener("change", renderExperimentRows);
renderExperimentRows();
