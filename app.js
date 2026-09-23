/**
 * Logic Hunt - Main Timer Engine & Controller
 * Precision timing, state machine, cinematic stage opening sequence, and coordinator controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Background Canvas
  const bg = new LogicHuntBackground('bg-canvas');

  // DOM Elements
  const timerDigits = document.getElementById('timer-digits');
  const timerContainer = document.getElementById('timer-container');
  const statusPill = document.getElementById('status-pill');
  const statusLabel = document.getElementById('status-label');
  const circleProgress = document.getElementById('circle-progress');

  // Control Buttons
  const btnStartPause = document.getElementById('btn-start-pause');
  const btnStartPauseLabel = document.getElementById('btn-start-pause-label');
  const btnStartPauseIcon = document.getElementById('btn-start-pause-icon');
  const btnReset = document.getElementById('btn-reset');
  const btnAdd1 = document.getElementById('btn-add-1');
  const btnAdd5 = document.getElementById('btn-add-5');
  const btnAdd10 = document.getElementById('btn-add-10');
  const btnOpenModal = document.getElementById('btn-open-modal');

  // Top Action Buttons
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-label');
  const soundIcon = document.getElementById('sound-icon');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const fullscreenLabel = document.getElementById('fullscreen-label');
  const fullscreenIcon = document.getElementById('fullscreen-icon');

  // Stage Opening Sequence Elements
  const openingOverlay = document.getElementById('stage-opening-overlay');
  const readyText = document.getElementById('ready-text');
  const countNumber = document.getElementById('countdown-number');
  const startBurstText = document.getElementById('start-burst-text');
  const shockwave = document.getElementById('shockwave-ring');

  // Modal Elements
  const modalBackdrop = document.getElementById('modal-backdrop');
  const btnModalCancel = document.getElementById('btn-modal-cancel');
  const btnModalApply = document.getElementById('btn-modal-apply');
  const inputHours = document.getElementById('input-hours');
  const inputMinutes = document.getElementById('input-minutes');
  const inputSeconds = document.getElementById('input-seconds');
  const presetChips = document.querySelectorAll('.preset-chip');

  // SVG Progress Ring Geometry
  const radius = circleProgress.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circleProgress.style.strokeDasharray = `${circumference} ${circumference}`;
  circleProgress.style.strokeDashoffset = '0';

  // State Variables
  const DEFAULT_INITIAL_SECONDS = 20 * 60; // 20:00 default
  let configuredTotalSeconds = DEFAULT_INITIAL_SECONDS;
  let remainingSeconds = DEFAULT_INITIAL_SECONDS;
  let targetEndTime = null;
  let timerInterval = null;
  let timerState = 'IDLE'; // 'IDLE', 'OPENING', 'RUNNING', 'PAUSED', 'TIMES_UP'
  let warningOneMinPlayed = false;

  // Format seconds to mm:ss or hh:mm:ss
  function formatTime(totalSecs) {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  // Update UI Elements
  function updateTimerDisplay() {
    if (timerState === 'TIMES_UP') {
      timerDigits.textContent = "TIME'S UP!";
      updateProgressRing(0);
      return;
    }

    timerDigits.textContent = formatTime(remainingSeconds);

    // Update Progress Ring (1 = full, 0 = empty)
    const ratio = configuredTotalSeconds > 0 ? remainingSeconds / configuredTotalSeconds : 0;
    updateProgressRing(ratio);

    // Warning Thresholds
    timerContainer.classList.remove('warning-5m', 'warning-1m', 'warning-10s', 'is-times-up');

    if (remainingSeconds <= 10 && remainingSeconds > 0) {
      timerContainer.classList.add('warning-10s');
    } else if (remainingSeconds <= 60 && remainingSeconds > 0) {
      timerContainer.classList.add('warning-1m');
      if (!warningOneMinPlayed && timerState === 'RUNNING') {
        window.soundEngine.playWarningPulse();
        warningOneMinPlayed = true;
      }
    } else if (remainingSeconds <= 300 && remainingSeconds > 0) {
      timerContainer.classList.add('warning-5m');
    }
  }

  function updateProgressRing(ratio) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const offset = circumference * (1 - clampedRatio);
    circleProgress.style.strokeDashoffset = offset;
  }

  function updateStatusIndicator(status) {
    statusPill.className = 'status-pill ' + status;
    if (status === 'live') {
      statusLabel.textContent = 'LIVE';
    } else if (status === 'paused') {
      statusLabel.textContent = 'PAUSED';
    } else if (status === 'times-up') {
      statusLabel.textContent = "TIME'S UP";
    } else {
      statusLabel.textContent = '▶ START EVENT';
    }
  }

  function updateControlButtons() {
    if (timerState === 'RUNNING') {
      btnStartPauseLabel.textContent = 'PAUSE';
      btnStartPause.className = 'ctrl-btn btn-pause';
      btnStartPauseIcon.innerHTML = `
        <rect x="5" y="4" width="4" height="16" rx="1"></rect>
        <rect x="15" y="4" width="4" height="16" rx="1"></rect>
      `;
    } else if (timerState === 'PAUSED') {
      btnStartPauseLabel.textContent = 'RESUME';
      btnStartPause.className = 'ctrl-btn btn-primary';
      btnStartPauseIcon.innerHTML = `
        <polygon points="5,3 19,12 5,21"></polygon>
      `;
    } else {
      btnStartPauseLabel.textContent = 'START';
      btnStartPause.className = 'ctrl-btn btn-primary';
      btnStartPauseIcon.innerHTML = `
        <polygon points="5,3 19,12 5,21"></polygon>
      `;
    }
  }

  // CINEMATIC STAGE OPENING SEQUENCE (Fast & High-Energy)
  async function runCinematicOpeningSequence() {
    timerState = 'OPENING';
    openingOverlay.classList.add('active');

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Reset opening texts
    readyText.classList.remove('show');
    countNumber.className = 'countdown-number';
    startBurstText.className = 'start-burst-text';
    shockwave.classList.remove('trigger');

    // Step 1: READY?
    openingOverlay.className = 'stage-opening-overlay active';
    await sleep(80);
    readyText.classList.add('show');
    await sleep(850);
    readyText.classList.remove('show');
    await sleep(100);

    // Step 2: 3 (Fast, punchy) — Blue background
    openingOverlay.className = 'stage-opening-overlay active overlay-count-3';
    countNumber.textContent = '3';
    countNumber.className = 'countdown-number animate-in count-3';
    shockwave.classList.remove('trigger');
    void shockwave.offsetWidth;
    shockwave.classList.add('trigger');
    window.soundEngine.playCountdownBeep(3);
    await sleep(620);
    countNumber.className = 'countdown-number';
    void countNumber.offsetWidth;
    await sleep(60);

    // Step 3: 2 (Guaranteed crisp animation) — Amber background
    openingOverlay.className = 'stage-opening-overlay active overlay-count-2';
    countNumber.textContent = '2';
    countNumber.className = 'countdown-number animate-in count-2';
    shockwave.classList.remove('trigger');
    void shockwave.offsetWidth;
    shockwave.classList.add('trigger');
    window.soundEngine.playCountdownBeep(2);
    await sleep(620);
    countNumber.className = 'countdown-number';
    void countNumber.offsetWidth;
    await sleep(60);

    // Step 4: 1 (Strong pulse, high chime) — Red background
    openingOverlay.className = 'stage-opening-overlay active overlay-count-1';
    countNumber.textContent = '1';
    countNumber.className = 'countdown-number animate-in count-1';
    shockwave.classList.remove('trigger');
    void shockwave.offsetWidth;
    shockwave.classList.add('trigger');
    window.soundEngine.playCountdownBeep(1);
    await sleep(620);
    countNumber.className = 'countdown-number';
    void countNumber.offsetWidth;
    await sleep(60);

    // Step 5: START! (Explosive finish)
    openingOverlay.className = 'stage-opening-overlay active overlay-start';
    startBurstText.className = 'start-burst-text animate-in';
    window.soundEngine.playStartExplosion();
    bg.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 180);

    await sleep(950);

    // Transition smoothly into live timer
    openingOverlay.classList.remove('active');
    await sleep(250);

    startLiveTimer();
  }

  // High Precision Timer Engine
  function startLiveTimer() {
    timerState = 'RUNNING';
    targetEndTime = Date.now() + remainingSeconds * 1000;
    updateStatusIndicator('live');
    updateControlButtons();
    updateTimerDisplay();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

      if (diff !== remainingSeconds) {
        remainingSeconds = diff;
        updateTimerDisplay();

        // 10s countdown audio tick
        if (remainingSeconds <= 10 && remainingSeconds > 0) {
          window.soundEngine.playCountdownBeep(remainingSeconds % 3 + 1);
        }

        if (remainingSeconds <= 0) {
          handleTimesUp();
        }
      }
    }, 250);
  }

  function pauseTimer() {
    if (timerState !== 'RUNNING') return;
    clearInterval(timerInterval);
    timerInterval = null;
    timerState = 'PAUSED';
    updateStatusIndicator('paused');
    updateControlButtons();
    window.soundEngine.playClick();
  }

  function resumeTimer() {
    if (timerState !== 'PAUSED') return;
    targetEndTime = Date.now() + remainingSeconds * 1000;
    startLiveTimer();
    window.soundEngine.playClick();
  }

  function handleTimesUp() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerState = 'TIMES_UP';
    remainingSeconds = 0;
    updateStatusIndicator('times-up');
    updateControlButtons();
    timerContainer.classList.add('is-times-up');
    updateTimerDisplay();

    window.soundEngine.playTimesUpFanfare();
    bg.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 200, ['#ef4444', '#f59e0b', '#ffffff', '#00f0ff']);
  }

  function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerState = 'IDLE';
    remainingSeconds = configuredTotalSeconds;
    warningOneMinPlayed = false;
    timerContainer.classList.remove('warning-5m', 'warning-1m', 'warning-10s', 'is-times-up');
    updateStatusIndicator('standby');
    updateControlButtons();
    updateTimerDisplay();
    window.soundEngine.playClick();
  }

  // Add time while running without resetting countdown
  function addTime(secondsToAdd) {
    remainingSeconds += secondsToAdd;
    configuredTotalSeconds = Math.max(configuredTotalSeconds, remainingSeconds);

    if (timerState === 'RUNNING') {
      targetEndTime += secondsToAdd * 1000;
    }

    if (remainingSeconds > 60) {
      warningOneMinPlayed = false;
    }

    updateTimerDisplay();
    window.soundEngine.playClick();
  }

  // EVENT LISTENERS: Controls
  btnStartPause.addEventListener('click', () => {
    if (timerState === 'IDLE') {
      runCinematicOpeningSequence();
    } else if (timerState === 'RUNNING') {
      pauseTimer();
    } else if (timerState === 'PAUSED') {
      resumeTimer();
    } else if (timerState === 'TIMES_UP') {
      resetTimer();
      runCinematicOpeningSequence();
    }
  });

  btnReset.addEventListener('click', resetTimer);

  // Click on Center Timer or Status Pill to launch READY 3 2 1 START sequence
  statusPill.addEventListener('click', () => {
    if (timerState === 'IDLE') {
      runCinematicOpeningSequence();
    } else if (timerState === 'PAUSED') {
      resumeTimer();
    } else if (timerState === 'TIMES_UP') {
      resetTimer();
      runCinematicOpeningSequence();
    }
  });

  timerDigits.style.cursor = 'pointer';
  timerDigits.title = 'Click or press Space to Start/Pause';
  timerDigits.addEventListener('click', () => {
    if (timerState === 'IDLE') {
      runCinematicOpeningSequence();
    } else if (timerState === 'RUNNING') {
      pauseTimer();
    } else if (timerState === 'PAUSED') {
      resumeTimer();
    } else if (timerState === 'TIMES_UP') {
      resetTimer();
      runCinematicOpeningSequence();
    }
  });

  btnAdd1.addEventListener('click', () => addTime(60));
  btnAdd5.addEventListener('click', () => addTime(300));
  btnAdd10.addEventListener('click', () => addTime(600));

  // SOUND TOGGLE
  btnSoundToggle.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    if (isMuted) {
      soundLabel.textContent = 'SOUND OFF';
      btnSoundToggle.style.opacity = '0.65';
      soundIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"></line>
        <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"></line>
      `;
    } else {
      soundLabel.textContent = 'SOUND ON';
      btnSoundToggle.style.opacity = '1';
      soundIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      `;
      window.soundEngine.playClick();
    }
  });

  // FULLSCREEN TOGGLE
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Error attempting fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      document.body.classList.add('is-fullscreen');
      fullscreenLabel.textContent = 'EXIT FULL SCREEN';
      fullscreenIcon.innerHTML = `
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
      `;
    } else {
      document.body.classList.remove('is-fullscreen');
      fullscreenLabel.textContent = 'FULL SCREEN';
      fullscreenIcon.innerHTML = `
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
      `;
      document.body.classList.remove('idle-cursor');
    }
  });

  // Mouse idle in fullscreen to auto-hide cursor
  let mouseIdleTimeout = null;
  window.addEventListener('mousemove', () => {
    if (document.fullscreenElement) {
      document.body.classList.remove('idle-cursor');
      clearTimeout(mouseIdleTimeout);
      mouseIdleTimeout = setTimeout(() => {
        if (document.fullscreenElement) {
          document.body.classList.add('idle-cursor');
        }
      }, 3000);
    }
  });

  // CUSTOM TIME MODAL
  function openModal() {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    inputHours.value = String(hours).padStart(2, '0');
    inputMinutes.value = String(minutes).padStart(2, '0');
    inputSeconds.value = String(seconds).padStart(2, '0');

    modalBackdrop.classList.add('open');
    window.soundEngine.playClick();
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    window.soundEngine.playClick();
  }

  btnOpenModal.addEventListener('click', openModal);
  btnModalCancel.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Quick Presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const minutes = parseInt(chip.getAttribute('data-mins'), 10);
      const hours = Math.floor(minutes / 60);
      const remMins = minutes % 60;

      inputHours.value = String(hours).padStart(2, '0');
      inputMinutes.value = String(remMins).padStart(2, '0');
      inputSeconds.value = '00';
      window.soundEngine.playClick();
    });
  });

  btnModalApply.addEventListener('click', () => {
    const h = parseInt(inputHours.value, 10) || 0;
    const m = parseInt(inputMinutes.value, 10) || 0;
    const s = parseInt(inputSeconds.value, 10) || 0;

    const total = h * 3600 + m * 60 + s;
    if (total > 0) {
      configuredTotalSeconds = total;
      remainingSeconds = total;

      if (timerState === 'RUNNING') {
        targetEndTime = Date.now() + remainingSeconds * 1000;
      }

      warningOneMinPlayed = false;
      timerContainer.classList.remove('warning-5m', 'warning-1m', 'warning-10s', 'is-times-up');
      updateTimerDisplay();
    }
    closeModal();
  });

  // KEYBOARD SHORTCUTS
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      btnStartPause.click();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      btnFullscreen.click();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      btnSoundToggle.click();
    } else if (e.key === 'Escape') {
      if (modalBackdrop.classList.contains('open')) {
        closeModal();
      }
    }
  });

  // Initial render
  updateTimerDisplay();
  updateStatusIndicator('standby');
  updateControlButtons();
});
