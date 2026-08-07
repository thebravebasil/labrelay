// Simple FAQ-style assistant. No API key, no external calls — just keyword
// matching against a small set of answers about how LabRelay works.
(function () {
  const FAQ = [
    { keys: ["post", "task", "researcher post"], a: "Log in, then go to \"Post a Task.\" Fill in a title, description, time estimate, and skills needed — it goes live on the board right away." },
    { keys: ["apply", "interested", "student apply"], a: "Browse open tasks, click \"I'm interested,\" and write a short note on why it interests you. The researcher will review it and accept or decline." },
    { keys: ["accept", "decline", "review applicant"], a: "Researchers review applicants on the \"My Tasks\" page — every task you've posted shows everyone who applied, with Accept / Decline buttons." },
    { keys: ["status", "did i get", "my application"], a: "Check \"My Applications\" — it shows every task you've applied to and whether it's pending, accepted, or declined." },
    { keys: ["submit", "finished work", "turn in"], a: "Once accepted, go to \"My Applications\" — you'll see the researcher's email and a field to paste a link to your finished work." },
    { keys: ["free", "cost", "money", "pay"], a: "LabRelay is completely free — no fees for researchers or students." },
    { keys: ["who", "made", "built", "founder"], a: "LabRelay was built by Mohammad Basil, a student in Clarksburg, MD. More on the About page." },
    { keys: ["login", "log in", "sign up", "account"], a: "Click \"Log in\" or \"Sign up\" in the top right. You can use email/password or Google." },
    { keys: ["contact", "email", "reach"], a: "Once you're logged in, you can reach a researcher directly through their task's contact info after being accepted." },
  ];

  const DEFAULT_REPLY = "I'm just a simple FAQ helper, so I don't have an answer for that one. Try the About or Dev Log pages, or ask about posting, applying, or how the site works.";

  function findAnswer(text) {
    const lower = text.toLowerCase();
    for (const entry of FAQ) {
      if (entry.keys.some(k => lower.includes(k))) return entry.a;
    }
    return DEFAULT_REPLY;
  }

  function init() {
    const toggle = document.createElement("button");
    toggle.className = "chatbot-toggle";
    toggle.type = "button";
    toggle.textContent = "AI";
    toggle.setAttribute("aria-label", "Open help assistant");

    const panel = document.createElement("div");
    panel.className = "chatbot-panel";
    panel.innerHTML = `
      <div class="chatbot-header">
        <div>LabRelay Helper<span class="sub">FAQ assistant, not generative AI</span></div>
        <button class="chatbot-close" type="button" aria-label="Close">✕</button>
      </div>
      <div class="chatbot-messages" id="chatbotMessages">
        <div class="chatbot-msg bot">Hi! Ask me how to post a task, apply, check your status, or submit finished work.</div>
      </div>
      <div class="chatbot-quick">
        <button type="button" data-q="How do I post a task?">Post a task</button>
        <button type="button" data-q="How do I apply?">Apply</button>
        <button type="button" data-q="Is it free?">Cost?</button>
      </div>
      <div class="chatbot-input-row">
        <input type="text" id="chatbotInput" placeholder="Ask a question…">
        <button type="button" id="chatbotSend">Send</button>
      </div>
    `;

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    const messages = panel.querySelector("#chatbotMessages");
    const input = panel.querySelector("#chatbotInput");
    const sendBtn = panel.querySelector("#chatbotSend");
    const closeBtn = panel.querySelector(".chatbot-close");

    function addMessage(text, who) {
      const div = document.createElement("div");
      div.className = "chatbot-msg " + who;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function handleSend(text) {
      const q = (text !== undefined ? text : input.value).trim();
      if (!q) return;
      addMessage(q, "user");
      input.value = "";
      setTimeout(() => addMessage(findAnswer(q), "bot"), 300);
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
})();
