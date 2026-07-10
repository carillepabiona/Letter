(() => {
  "use strict";

  /* ---------------------------------------------------------
     Fireflies (purely decorative, ignored for reduced motion)
  --------------------------------------------------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fireflyLayer = document.getElementById("fireflies");
  if (!reduceMotion && fireflyLayer) {
    const COUNT = window.innerWidth < 500 ? 14 : 22;
    for (let i = 0; i < COUNT; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = Math.random() * 100 + "%";
      f.style.top = Math.random() * 100 + "%";
      f.style.animationDuration = (6 + Math.random() * 8).toFixed(2) + "s, " + (2.5 + Math.random() * 3).toFixed(2) + "s";
      f.style.animationDelay = (Math.random() * 6).toFixed(2) + "s, " + (Math.random() * 4).toFixed(2) + "s";
      f.style.animationDirection = "alternate";
      fireflyLayer.appendChild(f);
    }
  }

  /* ---------------------------------------------------------
     Scene elements
  --------------------------------------------------------- */
  const envelopeScene = document.getElementById("scene-envelope");
  const letterScene   = document.getElementById("scene-letter");
  const envelope      = document.getElementById("envelope");
  const seal          = document.getElementById("seal");
  const backBtn       = document.getElementById("backBtn");
  const paper         = document.getElementById("paper");
  const dateEl        = document.getElementById("today-date");

  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }

  function openEnvelope() {
    if (envelope.classList.contains("is-open")) return;
    envelope.classList.add("is-open");
    seal.setAttribute("disabled", "true");

    // let the seal-crack + flap-open play out, then cross-fade into the letter
    window.setTimeout(() => {
      envelopeScene.classList.add("is-leaving");
      letterScene.setAttribute("aria-hidden", "false");
      window.setTimeout(() => paper && paper.scrollIntoView({ block: "start" }), 50);
      initReveal();
    }, 950);
  }

  function closeToEnvelope() {
    stopReading();
    letterScene.setAttribute("aria-hidden", "true");
    envelopeScene.classList.remove("is-leaving");
    envelope.classList.remove("is-open");
    seal.removeAttribute("disabled");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  seal.addEventListener("click", openEnvelope);
  seal.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
  });
  backBtn.addEventListener("click", closeToEnvelope);

  /* ---------------------------------------------------------
     Scroll reveal for each paragraph
  --------------------------------------------------------- */
  let revealInitialised = false;
  function initReveal() {
    if (revealInitialised) return;
    revealInitialised = true;
    const paragraphs = document.querySelectorAll("#letterBody p");
    if (!("IntersectionObserver" in window)) {
      paragraphs.forEach(p => p.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
    paragraphs.forEach((p, i) => {
      p.style.transitionDelay = Math.min(i * 60, 400) + "ms";
      io.observe(p);
    });
  }

  /* ---------------------------------------------------------
     Read-aloud, using the Web Speech API
  --------------------------------------------------------- */
  const playBtn     = document.getElementById("playBtn");
  const restartBtn  = document.getElementById("restartBtn");
  const speechNote  = document.getElementById("speechNote");
  const paragraphs  = Array.from(document.querySelectorAll("#letterBody p"));
  const synth       = window.speechSynthesis;
  const supportsSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  let queueIndex = 0;
  let isPlaying  = false;
  let chosenVoice = null;

  if (!supportsSpeech) {
    playBtn.setAttribute("disabled", "true");
    playBtn.style.opacity = ".5";
    playBtn.style.cursor = "not-allowed";
    if (speechNote) speechNote.hidden = false;
  } else {
    const pickVoice = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      chosenVoice =
        voices.find(v => /en-US|en_US/.test(v.lang) && /female/i.test(v.name)) ||
        voices.find(v => /en-GB|en_GB/.test(v.lang)) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0];
    };
    pickVoice();
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = pickVoice;
    }
  }

  function clearSpeakingHighlight() {
    paragraphs.forEach(p => p.classList.remove("is-speaking"));
  }

  function speakFrom(index) {
    if (!supportsSpeech) return;
    if (index >= paragraphs.length) {
      isPlaying = false;
      playBtn.classList.remove("is-playing");
      clearSpeakingHighlight();
      queueIndex = 0;
      return;
    }
    queueIndex = index;
    const el = paragraphs[index];
    el.classList.add("is-visible");
    clearSpeakingHighlight();
    el.classList.add("is-speaking");
    if (!reduceMotion) el.scrollIntoView({ block: "center", behavior: "smooth" });

    const utter = new SpeechSynthesisUtterance(el.textContent.trim());
    utter.rate = 0.92;
    utter.pitch = 1.02;
    if (chosenVoice) utter.voice = chosenVoice;

    utter.onend = () => {
      if (isPlaying) speakFrom(index + 1);
    };
    utter.onerror = () => {
      isPlaying = false;
      playBtn.classList.remove("is-playing");
    };

    synth.speak(utter);
  }

  function startReading() {
    if (!supportsSpeech) return;
    isPlaying = true;
    playBtn.classList.add("is-playing");
    if (synth.paused && synth.speaking) {
      synth.resume();
    } else {
      synth.cancel();
      speakFrom(queueIndex);
    }
  }

  function pauseReading() {
    isPlaying = false;
    playBtn.classList.remove("is-playing");
    if (supportsSpeech && synth.speaking) synth.pause();
  }

  function stopReading() {
    isPlaying = false;
    queueIndex = 0;
    playBtn.classList.remove("is-playing");
    clearSpeakingHighlight();
    if (supportsSpeech) synth.cancel();
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying) pauseReading();
    else startReading();
  });

  restartBtn.addEventListener("click", () => {
    stopReading();
    queueIndex = 0;
    paragraphs.forEach(p => p.classList.add("is-visible"));
    if (paper) paper.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    window.setTimeout(startReading, 300);
  });

  // stop speaking politely if the tab is hidden or the page unloads
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && supportsSpeech) synth.pause();
  });
  window.addEventListener("beforeunload", () => {
    if (supportsSpeech) synth.cancel();
  });
})();
