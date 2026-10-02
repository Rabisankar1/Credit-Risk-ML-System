"use strict";

/* ========== CONFIG ========== */
const API_BASE = "http://127.0.0.1:8000";
const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // matches r="52" in the SVG
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (id) => document.getElementById(id);

/* ========== FIELD DEFINITIONS & VALIDATION RULES ========== */
// type: "int" | "float" | "text"; check returns an error message or "" when valid
const FIELDS = [
  { name: "person_age", type: "int", check: (v) => (v < 18 || v > 100 ? "Age must be between 18 and 100." : "") },
  { name: "person_income", type: "float", check: (v) => (v <= 0 ? "Income must be greater than 0." : "") },
  { name: "person_home_ownership", type: "text" },
  { name: "person_emp_length", type: "float", check: (v) => (v < 0 ? "Employment length cannot be negative." : "") },
  { name: "loan_intent", type: "text" },
  { name: "loan_grade", type: "text" },
  { name: "loan_amnt", type: "float", check: (v) => (v <= 0 ? "Loan amount must be greater than 0." : "") },
  { name: "loan_int_rate", type: "float", check: (v) => (v <= 0 ? "Interest rate must be greater than 0." : "") },
  { name: "loan_percent_income", type: "float", check: (v) => (v < 0 ? "Value cannot be negative." : "") },
  { name: "cb_person_default_on_file", type: "text" },
  { name: "cb_person_cred_hist_length", type: "int", check: (v) => (v < 0 ? "History length cannot be negative." : "") },
];

const form = $("loanForm");

/** Validate one field, update its UI state, return parsed value or null on error. */
function validateField(def) {
  const input = form.elements[def.name];
  const wrapper = input.closest(".field");
  const errEl = $("e-" + def.name);
  const raw = input.value.trim();
  let message = "";
  let value = raw;

  if (raw === "") {
    message = "This field is required.";
  } else if (def.type !== "text") {
    value = Number(raw);
    if (!Number.isFinite(value)) message = "Enter a valid number.";
    else if (def.type === "int" && !Number.isInteger(value)) message = "Enter a whole number.";
    else message = def.check ? def.check(value) : "";
  }

  errEl.textContent = message;
  wrapper.classList.toggle("invalid", Boolean(message));
  wrapper.classList.toggle("valid", !message);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  return message ? null : value;
}

/** Validate the whole form. Returns the typed payload, or null if anything is invalid. */
function collectPayload() {
  const payload = {};
  let firstInvalid = null;
  FIELDS.forEach((def) => {
    const value = validateField(def);
    if (value === null) firstInvalid = firstInvalid || form.elements[def.name];
    else payload[def.name] = value;
  });
  if (firstInvalid) { firstInvalid.focus(); return null; }
  return payload;
}

// Live validation: re-check a field after the user has interacted with it
FIELDS.forEach((def) => {
  const input = form.elements[def.name];
  input.addEventListener("blur", () => validateField(def));
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("invalid")) validateField(def);
  });
});

/* ========== TOASTS ========== */
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = "toast " + (type === "info" ? "info" : "");
  toast.setAttribute("role", "alert");

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "ico");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", type === "info" ? "#i-check" : "#i-warn");
  icon.appendChild(use);

  const text = document.createElement("p");
  text.textContent = message; // textContent: never inject API text as HTML

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss notification");
  close.textContent = "×";

  const dismiss = () => {
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 300);
  };
  close.addEventListener("click", dismiss);
  toast.append(icon, text, close);
  $("toasts").appendChild(toast);
  setTimeout(dismiss, 6000);
}

/* ========== API HEALTH CHECK ========== */
function setApiStatus(online) {
  const state = online ? "online" : "offline";
  const label = online ? "API Connected" : "API Offline";
  $("navStatus").dataset.state = state;
  $("apiState").dataset.state = state;
  $("navStatusText").textContent = online ? "System Online" : "System Offline";
  $("apiStateText").textContent = label;
}

async function checkHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    setApiStatus(res.ok);
  } catch {
    setApiStatus(false);
  } finally {
    clearTimeout(timer);
  }
}

/* ========== FORMATTING & ANIMATION HELPERS ========== */
const pct = (fraction, digits = 2) => (fraction * 100).toFixed(digits) + "%";

/** Animate ring + counter from 0 to the probability, in sync. */
function animateGauge(probability) {
  const ring = $("ringFill");
  const label = $("probValue");
  const clamped = Math.min(Math.max(probability, 0), 1);
  const target = RING_CIRCUMFERENCE * (1 - clamped);

  if (prefersReducedMotion) {
    ring.style.strokeDashoffset = target;
    label.textContent = pct(probability, 1);
    return;
  }
  ring.style.strokeDashoffset = RING_CIRCUMFERENCE;
  const duration = 1400;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = ease(t);
    ring.style.strokeDashoffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE - target) * eased;
    label.textContent = pct(probability * eased, 1);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ========== RESULT RENDERING ========== */
// Every displayed value comes from the API response.
function renderResult(data) {
  const probability = Number(data.default_probability);
  const threshold = Number(data.threshold);
  const prediction = Number(data.default_prediction);
  const isHigh = prediction === 1 || data.Result === "High Risk";
  const levelText = isHigh ? "High Risk" : "Low Risk";

  const result = $("resultState");
  $("emptyState").hidden = true;
  result.hidden = false;

  // restart reveal animations on repeated predictions
  result.classList.remove("show");
  void result.offsetWidth;
  result.classList.toggle("high", isHigh);
  result.classList.add("show");

  $("riskText").textContent = levelText.toUpperCase();
  $("riskIcon").setAttribute("href", isHigh ? "#i-warn" : "#i-check");
  $("dProb").textContent = pct(probability);
  $("dThresh").textContent = pct(threshold);
  $("dPred").textContent = String(prediction);
  $("dLevel").textContent = levelText;

  animateGauge(probability);
}

/* ========== SUBMIT ========== */
function setLoading(loading) {
  const btn = $("submitBtn");
  btn.disabled = loading;
  btn.classList.toggle("loading", loading);
  btn.setAttribute("aria-busy", String(loading));
  $("btnText").textContent = loading ? "Analyzing Application..." : "Analyze Credit Risk";
}

async function handleSubmit(event) {
  event.preventDefault();
  const payload = collectPayload();
  if (!payload) {
    showToast("Please fix the highlighted fields and try again.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
      } catch { /* non-JSON error body */ }
      throw new Error(res.status === 422
        ? `The API rejected the input${detail ? ": " + detail : "."}`
        : `Server error (${res.status}). Please try again.`);
    }

    const data = await res.json();
    if (typeof data.default_probability !== "number") throw new Error("Unexpected response from the API.");
    setApiStatus(true);
    renderResult(data);
  } catch (err) {
    if (err instanceof TypeError) { // fetch network failure
      setApiStatus(false);
      showToast("Unable to connect to Credit Risk API.");
    } else {
      showToast(err.message || "Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
}

/* ========== INIT ========== */
form.addEventListener("submit", handleSubmit);
checkHealth();
setInterval(checkHealth, 20000); // keep status fresh
