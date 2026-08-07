// Real in-browser AI chatbot. Runs an actual small language model directly
// in the visitor's browser using WebGPU — no API key, no server, no cost.
// Uses Transformers.js (https://huggingface.co/docs/transformers.js).

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
const SYSTEM_PROMPT = "You are a short, friendly helper for LabRelay, a website that connects student volunteers with researchers who need help on small research tasks (literature reviews, data entry, survey outreach). Answer briefly and clearly. If asked something unrelated to LabRelay, still try to help, but keep answers short.";

let generatorPromise = null;
let chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];

function supportsWebGPU() {
  return typeof navigator !== "undefined" && !!navigator.gpu;
}

async function loadGenerator(onProgress) {
  if (generatorPromise) return generatorPromise;

  generatorPromise = (async () => {
    const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2");
    const generator = await pipeline("text-generation", MODEL_ID, {
      device: "webgpu",
      dtype: "q4f16",
      progress_callback: onProgress,
    });
    return generator;
  })();

  return generatorPromise;
}

function init() {
  const toggle = document.createElement("button");
  toggle.className = "chatbot-toggle";
  toggle.type = "button";
  toggle.textContent = "AI";
  toggle.setAttribute("aria-label", "Open AI assistant");

  const panel = document.createElement("div");
  panel.className = "chatbot-panel";
  panel.innerHTML = `
    <div class="chatbot-header">
      <div>LabRelay AI<span class="sub">Runs locally in your browser</span></div>
      <button class="chatbot-close" type="button" aria-label="Close">✕</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages">
      <div class="chatbot-msg bot">Hi! I'm a small AI model running right in your browser. Ask me anything about LabRelay.</div>
    </div>
    <div class="chatbot-quick">
      <button type="button" data-q="How do I post a task?">Post a task</button>
      <button type="button" data-q="How do I apply to a task?">Apply</button>
      <button type="button" data-q="Is LabRelay free?">Cost?</button>
    </div>
    <div class="chatbot-input-row">
      <input type="text" id="chatbotInput" placeholder="Ask a question…">
      <button type="button" id="chatbotSend">Send</button>
    </div>
  `;

  const overlay = document.createElement("div");
  overlay.className = "ai-load-overlay";
  overlay.innerHTML = `
    <div class="ai-load-box">
      <div class="ai-spinner"></div>
      <div class="ai-load-status" id="aiLoadStatus">Starting…</div>
      <div class="ai-load-bar-track"><div class="ai-load-bar-fill" id="aiLoadBar"></div></div>
      <div class="ai-load-note">Downloading a small AI model to run in your browser. This only happens once — it's cached after that.</div>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);
  document.body.appendChild(overlay);

  const messages = panel.querySelector("#chatbotMessages");
  const input = panel.querySelector("#chatbotInput");
  const sendBtn = panel.querySelector("#chatbotSend");
  const closeBtn = panel.querySelector(".chatbot-close");
  const loadStatus = overlay.querySelector("#aiLoadStatus");
  const loadBar = overlay.querySelector("#aiLoadBar");

  let generator = null;
  let ready = false;
  let busy = false;

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "chatbot-msg " + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function ensureReady() {
    if (ready) return true;

    if (!supportsWebGPU()) {
      addMessage("Your browser doesn't support WebGPU, so the in-browser AI can't run here. Try the latest Chrome or Edge on a laptop or desktop.", "bot");
      return false;
    }

    overlay.classList.add("show");
    try {
      generator = await loadGenerator((progress) => {
        if (progress.status === "progress") {
          const pct = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
          loadStatus.textContent = "Loading: " + progress.file;
          loadBar.style.width = pct + "%";
        } else if (progress.status === "done") {
          loadStatus.textContent = "Finishing up…";
        }
      });
      ready = true;
      overlay.classList.remove("show");
      return true;
    } catch (err) {
      console.error("Failed to load AI model:", err);
      overlay.classList.remove("show");
      addMessage("The AI model couldn't load — your device or browser may not support this. Try a recent Chrome/Edge on a laptop.", "bot");
      return false;
    }
  }

  async function handleSend(text) {
    const q = (text !== undefined ? text : input.value).trim();
    if (!q || busy) return;
    input.value = "";
    addMessage(q, "user");

    const okay = await ensureReady();
    if (!okay) return;

    busy = true;
    const thinkingMsg = addMessage("…", "bot");

    try {
      chatHistory.push({ role: "user", content: q });
      const output = await generator(chatHistory, { max_new_tokens: 200, temperature: 0.7 });
      const reply = output[0].generated_text.at(-1).content.trim();
      chatHistory.push({ role: "assistant", content: reply });
      thinkingMsg.textContent = reply;
    } catch (err) {
      console.error("Generation failed:", err);
      thinkingMsg.textContent = "Something went wrong generating a reply. Try again.";
    } finally {
      busy = false;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  toggle.addEventListener("click", () => panel.classList.toggle("open"));
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
  sendBtn.addEventListener("click", () => handleSend());
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSend(); });
  panel.querySelectorAll(".chatbot-quick button").forEach(btn => {
    btn.addEventListener("click", () => handleSend(btn.dataset.q));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
