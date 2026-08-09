// LabRelay AI Chatbot
// Runs locally in the browser with WebGPU, via WebLLM.
// Uses SmolLM2-360M — a small, low-VRAM model chosen specifically
// to avoid the resource issues a larger model caused on this device.

import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL = "SmolLM2-360M-Instruct-q4f16_1-MLC";

let engine = null;
let loading = false;

// --------------------------------------------------
// LabRelay pages the AI is allowed to redirect to.
// These match the actual filenames in this repo.
// --------------------------------------------------

const ROUTES = {
  home: "index.html",
  browse: "board.html",
  tasks: "board.html",
  "browse tasks": "board.html",
  post: "post.html",
  "post a task": "post.html",
  "my tasks": "my-tasks.html",
  applications: "my-applications.html",
  "my applications": "my-applications.html",
  devlog: "devlog.html",
  "dev log": "devlog.html",
  about: "about.html"
};

// --------------------------------------------------
// Create chatbot UI
// --------------------------------------------------

function createChatbot() {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <button id="lr-ai-button" aria-label="Open LabRelay AI">✦</button>

    <section id="lr-ai-panel" aria-label="LabRelay AI">
      <header id="lr-ai-header">
        <div>
          <strong>LabRelay AI</strong>
          <small id="lr-ai-status">Ready</small>
        </div>
        <button id="lr-ai-close" aria-label="Close chatbot">×</button>
      </header>

      <div id="lr-ai-messages">
        <div class="lr-ai-message bot">
          Hi! I'm LabRelay AI. I can help you find tasks,
          understand how LabRelay works, or take you to the
          right page.
        </div>
      </div>

      <div id="lr-ai-loading">
        <div>Preparing AI…</div>
        <progress id="lr-ai-progress" value="0" max="1"></progress>
        <small id="lr-ai-progress-text">0%</small>
      </div>

      <form id="lr-ai-form">
        <input id="lr-ai-input" autocomplete="off" placeholder="Ask LabRelay..." maxlength="500">
        <button type="submit">Send</button>
      </form>
    </section>
  `;

  document.body.appendChild(wrapper);

  document.getElementById("lr-ai-button").addEventListener("click", openChat);
  document.getElementById("lr-ai-close").addEventListener("click", closeChat);
  document.getElementById("lr-ai-form").addEventListener("submit", handleMessage);
}

// --------------------------------------------------
// Open / close
// --------------------------------------------------

function openChat() {
  document.getElementById("lr-ai-panel").classList.add("open");
  // Don't download the model until the user actually opens the chatbot.
  if (!engine && !loading) {
    loadAI();
  }
}

function closeChat() {
  document.getElementById("lr-ai-panel").classList.remove("open");
}

// --------------------------------------------------
// WebGPU check
// --------------------------------------------------

async function checkWebGPU() {
  if (!navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

// --------------------------------------------------
// Load model
// --------------------------------------------------

async function loadAI() {
  loading = true;

  const status = document.getElementById("lr-ai-status");
  const loadingBox = document.getElementById("lr-ai-loading");
  const progress = document.getElementById("lr-ai-progress");
  const progressText = document.getElementById("lr-ai-progress-text");

  const supported = await checkWebGPU();

  if (!supported) {
    status.textContent = "WebGPU unavailable";
    loadingBox.innerHTML = `<div>Your browser doesn't support WebGPU. You can still use LabRelay normally.</div>`;
    loading = false;
    return;
  }

  status.textContent = "Loading AI…";
  loadingBox.style.display = "block";

  try {
    engine = await CreateMLCEngine(MODEL, {
      initProgressCallback: (p) => {
        const percent = Math.round((p.progress || 0) * 100);
        progress.value = p.progress || 0;
        progressText.textContent = `${percent}%`;
      }
    });

    status.textContent = "AI ready";
    loadingBox.style.display = "none";
  } catch (error) {
    console.error("LabRelay AI failed:", error);
    status.textContent = "AI unavailable";
    loadingBox.innerHTML = `<div>The AI couldn't start on this device. LabRelay itself is still available.</div>`;
  }

  loading = false;
}

// --------------------------------------------------
// Hard facts about LabRelay. These are answered directly,
// WITHOUT the AI, so the model can never hallucinate wrong
// answers about things like pricing.
// --------------------------------------------------

const FACTS = [
  {
    keys: ["cost", "fee", "price", "pricing", "pay", "$", "free", "charge"],
    a: "LabRelay is completely free — no fees for researchers or students, ever."
  },
  {
    keys: ["how do i post", "post a task", "researcher post"],
    a: "Log in, then go to \"Post a Task.\" Describe the task, time estimate, and skills needed — it's live on the board right away."
  },
  {
    keys: ["how do i apply", "apply for", "interested in a task"],
    a: "Browse open tasks, click \"I'm interested,\" and write a short note on why it interests you."
  },
  {
    keys: ["who made", "who built", "founder", "who created"],
    a: "LabRelay was built by Mohammad Basil, a student in Montgomery County, MD. More on the About page."
  },
];

function detectFact(message) {
  const text = message.toLowerCase();
  for (const entry of FACTS) {
    if (entry.keys.some(k => text.includes(k))) return entry.a;
  }
  return null;
}

// --------------------------------------------------
// Redirect detection (deterministic, not AI-driven —
// keeps navigation safe and instant)
// --------------------------------------------------

function detectRoute(message) {
  const text = message.toLowerCase().trim();

  if (text.includes("browse tasks") || text.includes("find tasks") || text.includes("show me tasks") || text.includes("open tasks")) {
    return "browse";
  }
  if (text.includes("post a task") || text.includes("post task") || text.includes("create a task")) {
    return "post";
  }
  if (text.includes("my applications")) {
    return "applications";
  }
  if (text.includes("my tasks") || text.includes("tasks i've posted")) {
    return "my tasks";
  }
  if (text.includes("dev log") || text.includes("development log")) {
    return "devlog";
  }
  if (text === "about" || text.includes("about labrelay")) {
    return "about";
  }
  return null;
}

function redirectUser(route) {
  const destination = ROUTES[route];
  if (!destination) return false;

  addMessage(`Taking you to <strong>${route}</strong>…`, "bot");
  setTimeout(() => { window.location.href = destination; }, 700);
  return true;
}

// --------------------------------------------------
// Handle chat message
// --------------------------------------------------

async function handleMessage(event) {
  event.preventDefault();

  const input = document.getElementById("lr-ai-input");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  addMessage(message, "user");

  // Navigation happens without the AI — instant and doesn't need the GPU.
  const route = detectRoute(message);
  if (route) {
    redirectUser(route);
    return;
  }

  // Core facts (pricing, how things work) are answered directly,
  // never by the AI, so they can't be hallucinated.
  const fact = detectFact(message);
  if (fact) {
    addMessage(fact, "bot");
    return;
  }

  if (!engine) {
    if (loading) {
      addMessage("I'm still loading. The first load can take a little while since the model has to download — after that it's cached by the browser.", "bot");
    } else {
      addMessage("The local AI isn't available on this device. You can still browse LabRelay normally.", "bot");
    }
    return;
  }

  const sendButton = document.querySelector("#lr-ai-form button");
  sendButton.disabled = true;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are LabRelay AI. LabRelay is a research task exchange connecting researchers (professors, doctors) with students who want practical research experience. Researchers post manageable tasks; students browse and apply. LabRelay is 100% free — there is no fee of any kind, for anyone, ever. Be concise and friendly. Do not invent LabRelay features, pages, or fees that don't exist. Never claim you completed an action the website didn't actually do. If someone wants to browse tasks, mention the Browse Tasks page. If someone wants to post a task, mention Post a Task. Keep answers under 100 words.`
        },
        { role: "user", content: message }
      ],
      temperature: 0.5,
      max_tokens: 150
    });

    const answer = response.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    addMessage(answer, "bot");
  } catch (error) {
    console.error(error);
    addMessage("Sorry, the local AI ran into a problem. Please try again.", "bot");
  }

  sendButton.disabled = false;
}

// --------------------------------------------------
// Messages
// --------------------------------------------------

function addMessage(text, type) {
  const messages = document.getElementById("lr-ai-messages");
  const div = document.createElement("div");
  div.className = `lr-ai-message ${type}`;
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// --------------------------------------------------
// Start
// --------------------------------------------------

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createChatbot);
} else {
  createChatbot();
}
