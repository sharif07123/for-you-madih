/* ============================================
   HEART EXPERIENCE - Main Script
   ============================================ */

// ---- STATE ----
const state = {
    stage: 'heartbeat',
    crackLevel: 0,
    maxCracks: 5,
    isDragging: false,
    dragStartX: 0,
    scrollRevealed: 0,
    pinCode: '',
    correctPin: '041316',
    audioCtx: null,
};

// ---- DOM REFS ----
const $ = (s) => document.querySelector(s);
const dom = {
    bgCanvas: $('#bgCanvas'),
    crackCanvas: $('#crackCanvas'),
    scene: $('#scene'),
    hint: $('#hint'),
    crackCount: $('#crackCount'),
    heartContainer: $('#heartContainer'),
    heartSvg: $('#heartSvg'),
    heartPath: $('#heartPath'),
    cracksGroup: $('#cracksGroup'),
    hammer: $('#hammer'),
    leftHalf: $('#leftHalf'),
    rightHalf: $('#rightHalf'),
    scrollContainer: $('#scrollContainer'),
    scrollPaper: $('#scrollPaper'),
    dragHint: $('#dragHint'),
    lockBtn: $('#lockBtn'),
    pinModal: $('#pinModal'),
    pinDisplay: $('#pinDisplay'),
    pinCard: $('.pin-card'),
    preCelebration: $('#preCelebration'),
    preCanvas: $('#preCanvas'),
    preText1: $('#preText1'),
    preText2: $('#preText2'),
    preGlow: $('#preGlow'),
    celebration: $('#celebration'),
    celebrationFrame: $('.celebration-frame'),
    finalPhoto: $('#finalPhoto'),
    crackSound: $('#crackSound'),
    paperSound: $('#paperSound'),
    celebrationSound: $('#celebrationSound'),
    romanticSound: $('#romanticSound'),
    wrongSound: $('#wrongSound'),
};

// ---- CRACK DEFINITIONS ----
const crackStages = [
    [
        { d: 'M256,112 L260,155 L253,190', w: 2.5 },
        { d: 'M257,148 L240,162', w: 1.5 },
    ],
    [
        { d: 'M253,190 L262,240 L258,280', w: 2.5 },
        { d: 'M260,220 L230,235 L215,222', w: 1.8 },
        { d: 'M261,250 L290,238 L305,248', w: 1.5 },
    ],
    [
        { d: 'M258,280 L255,330 L256,370', w: 3 },
        { d: 'M256,310 L218,295 L188,305', w: 1.8 },
        { d: 'M255,340 L298,325 L325,338', w: 1.5 },
        { d: 'M240,162 L205,175 L180,162', w: 1.2 },
    ],
    [
        { d: 'M256,370 L256,410 L256,435', w: 3.5 },
        { d: 'M188,305 L155,320 L125,298', w: 1.8 },
        { d: 'M325,338 L358,325 L388,340', w: 1.8 },
        { d: 'M305,248 L340,235 L375,248', w: 1.2 },
        { d: 'M180,162 L148,175 L120,158', w: 1.2 },
    ],
    [
        { d: 'M256,435 L256,448', w: 4 },
        { d: 'M125,298 L95,310 L65,285', w: 1.5 },
        { d: 'M388,340 L418,325 L445,340', w: 1.5 },
        { d: 'M375,248 L405,238 L432,250', w: 1 },
        { d: 'M120,158 L90,168 L62,152', w: 1 },
    ],
];

// ---- AUDIO ----
const audio = {
    initCtx() {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playCrack() {
        try {
            dom.crackSound.currentTime = 0;
            dom.crackSound.play().catch(() => {});
        } catch (e) {}
    },
    startPaper() {
        try {
            dom.paperSound.currentTime = 0;
            dom.paperSound.play().catch(() => {});
        } catch (e) {}
    },
    stopPaper() {
        try { dom.paperSound.pause(); } catch (e) {}
    },
    playWrong() {
        try {
            dom.wrongSound.currentTime = 0;
            dom.wrongSound.play().catch(() => {});
        } catch (e) {}
    },
    playRomantic() {
        try { dom.romanticSound.play().catch(() => {}); } catch (e) {}
    },
    playCelebration() {
        try { dom.celebrationSound.play().catch(() => {}); } catch (e) {}
    },
    playKeypress() {
        this.initCtx();
        const ctx = state.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880 + Math.random() * 200;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    },
};

// ---- BACKGROUND PARTICLES ----
const bgParticles = [];
let bgCtx;
function initBgParticles() {
    const c = dom.bgCanvas;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    bgCtx = c.getContext('2d');
    for (let i = 0; i < 50; i++) {
        bgParticles.push({
            x: Math.random() * c.width,
            y: Math.random() * c.height,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.3 + 0.05,
        });
    }
    animBgParticles();
}
function animBgParticles() {
    bgCtx.clearRect(0, 0, dom.bgCanvas.width, dom.bgCanvas.height);
    bgParticles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = dom.bgCanvas.width;
        if (p.x > dom.bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = dom.bgCanvas.height;
        if (p.y > dom.bgCanvas.height) p.y = 0;
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255,120,160,${p.a})`;
        bgCtx.fill();
    });
    requestAnimationFrame(animBgParticles);
}

// ---- CRACK PARTICLES ----
const crackParticles = [];
let ckCtx;
function initCrackCanvas() {
    const c = dom.crackCanvas;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    ckCtx = c.getContext('2d');
    animCrackParticles();
}
function emitCrackParticles(cx, cy, count = 30) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const colors = ['#ffcc80', '#ff8a65', '#ff4b6e', '#fff', '#ffd54f'];
        crackParticles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            r: Math.random() * 3.5 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: Math.random() * 0.02 + 0.015,
            gravity: 0.12,
        });
    }
}
function animCrackParticles() {
    ckCtx.clearRect(0, 0, dom.crackCanvas.width, dom.crackCanvas.height);
    for (let i = crackParticles.length - 1; i >= 0; i--) {
        const p = crackParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) { crackParticles.splice(i, 1); continue; }
        ckCtx.globalAlpha = p.life;
        ckCtx.beginPath();
        ckCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ckCtx.fillStyle = p.color;
        ckCtx.fill();
    }
    ckCtx.globalAlpha = 1;
    requestAnimationFrame(animCrackParticles);
}

// ---- SCREEN FLASH ----
function screenFlash() {
    const el = document.createElement('div');
    el.className = 'screen-flash';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 500);
}

// ---- HAMMER ANIMATION ----
function animateHammer(onImpact) {
    const h = dom.hammer;
    const tl = gsap.timeline();
    tl.set(h, { opacity: 0, rotation: -70 })
      .to(h, { opacity: 1, duration: 0.06 })
      .to(h, { rotation: 12, duration: 0.22, ease: 'power3.in' })
      .call(() => { if (onImpact) onImpact(); })
      .to(h, { rotation: -8, duration: 0.1, ease: 'power2.out' })
      .to(h, { rotation: 0, duration: 0.08, ease: 'power1.out' })
      .to(h, { opacity: 0, duration: 0.25, delay: 0.08 });
}

// ---- ADD CRACKS ----
function addCracks(level) {
    const stage = crackStages[level];
    if (!stage) return;
    stage.forEach((crack, i) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', crack.d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'rgba(255,230,200,0.9)');
        path.setAttribute('stroke-width', crack.w);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        dom.cracksGroup.appendChild(path);
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        gsap.to(path, {
            strokeDashoffset: 0,
            duration: 0.4,
            delay: i * 0.08,
            ease: 'power2.out',
        });
    });
}

// ---- HEART CLICK ----
function onHeartClick() {
    if (state.stage !== 'heartbeat' && state.stage !== 'cracking') return;
    state.stage = 'cracking';
    if (state.crackLevel >= state.maxCracks) return;

    // Stop heartbeat
    dom.heartSvg.classList.add('no-beat');

    // Hammer + crack
    animateHammer(() => {
        audio.playCrack();
        addCracks(state.crackLevel);
        screenFlash();

        // Shake
        dom.heartContainer.classList.remove('shake');
        void dom.heartContainer.offsetWidth;
        dom.heartContainer.classList.add('shake');

        // Particles from heart center
        const rect = dom.heartContainer.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.4;
        emitCrackParticles(cx, cy, 25 + state.crackLevel * 8);

        state.crackLevel++;
        dom.crackCount.textContent = `${state.crackLevel} / ${state.maxCracks}`;

        if (state.crackLevel >= state.maxCracks) {
            dom.hint.classList.add('hidden');
            setTimeout(splitHeart, 800);
        }
    });
}

// ---- SPLIT HEART ----
function splitHeart() {
    state.stage = 'splitting';
    dom.heartSvg.style.display = 'none';
    dom.crackCount.style.opacity = '0';
    dom.hint.style.display = 'none';
    dom.leftHalf.classList.add('visible');
    dom.rightHalf.classList.add('visible');

    const splitDist = 90;
    gsap.to(dom.leftHalf, {
        x: -splitDist, duration: 1.2, ease: 'power3.inOut',
    });
    gsap.to(dom.rightHalf, {
        x: splitDist, duration: 1.2, ease: 'power3.inOut',
        onComplete: showScroll,
    });

    // Big particle burst
    const rect = dom.heartContainer.getBoundingClientRect();
    emitCrackParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
}

// ---- SHOW SCROLL ----
function showScroll() {
    state.stage = 'scroll';
    dom.scrollContainer.classList.add('visible');
    // Show initial width (just "Madiha")
    gsap.to(dom.scrollContainer, { width: 130, duration: 0.8, ease: 'power2.out' });
    dom.dragHint.classList.add('visible');
    dom.rightHalf.classList.add('draggable');
    initDrag();
}

// ---- DRAG INTERACTION ----
const DRAG_MAX = 380;
let currentRightX = 90; // initial split distance

function getPointerX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
}

function initDrag() {
    const rh = dom.rightHalf;

    const start = (e) => {
        if (state.stage !== 'scroll') return;
        e.preventDefault();
        state.isDragging = true;
        state.dragStartX = getPointerX(e) - currentRightX;
        rh.classList.add('dragging');
        audio.startPaper();
    };
    const move = (e) => {
        if (!state.isDragging) return;
        e.preventDefault();
        const pointerX = getPointerX(e);
        let newX = pointerX - state.dragStartX;
        newX = Math.max(90, Math.min(90 + DRAG_MAX, newX));
        currentRightX = newX;
        gsap.set(rh, { x: newX });

        // Update scroll width
        const progress = (newX - 90) / DRAG_MAX;
        const paperEl = dom.scrollPaper;
        const fullWidth = paperEl.scrollWidth;
        const scrollW = 130 + progress * (fullWidth - 130 + 40);
        dom.scrollContainer.style.width = scrollW + 'px';

        state.scrollRevealed = progress;
    };
    const end = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        rh.classList.remove('dragging');
        audio.stopPaper();

        if (state.scrollRevealed >= 0.85) {
            // Snap to full
            gsap.to(rh, { x: 90 + DRAG_MAX, duration: 0.4, ease: 'power2.out' });
            const paperEl = dom.scrollPaper;
            gsap.to(dom.scrollContainer, {
                width: paperEl.scrollWidth + 40,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    state.stage = 'lock';
                    dom.dragHint.classList.remove('visible');
                    showLock();
                },
            });
        }
    };

    rh.addEventListener('mousedown', start);
    rh.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
}

// ---- LOCK ----
function showLock() {
    setTimeout(() => {
        dom.lockBtn.classList.add('visible');
    }, 300);
}

dom.lockBtn.addEventListener('click', () => {
    if (state.stage !== 'lock') return;
    state.stage = 'pin';
    dom.lockBtn.classList.remove('visible');
    dom.pinModal.classList.add('visible');
});

// ---- PIN PAD ----
document.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        audio.playKeypress();

        if (key === 'clear') {
            state.pinCode = '';
            updatePinDots();
            return;
        }
        if (key === 'enter') {
            checkPin();
            return;
        }
        if (state.pinCode.length >= 6) return;
        state.pinCode += key;
        updatePinDots();

        // Auto-check when 6 digits entered
        if (state.pinCode.length === 6) {
            setTimeout(checkPin, 300);
        }
    });
});

function updatePinDots() {
    document.querySelectorAll('.pin-dot').forEach((dot, i) => {
        dot.classList.toggle('filled', i < state.pinCode.length);
        dot.classList.remove('error');
    });
}

function checkPin() {
    if (state.pinCode === state.correctPin) {
        // Correct!
        dom.pinModal.classList.remove('visible');
        setTimeout(startPreCelebration, 400);
    } else {
        // Wrong
        audio.playWrong();
        dom.pinCard.classList.remove('shake');
        void dom.pinCard.offsetWidth;
        dom.pinCard.classList.add('shake');
        document.querySelectorAll('.pin-dot').forEach(d => d.classList.add('error'));
        setTimeout(() => {
            state.pinCode = '';
            updatePinDots();
        }, 600);
    }
}

// ---- PRE-CELEBRATION (10 seconds) ----
let preParticles = [];
let preCtx;

function startPreCelebration() {
    state.stage = 'preCelebration';
    dom.preCelebration.classList.add('visible');
    audio.playRomantic();

    // Init canvas
    const c = dom.preCanvas;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    preCtx = c.getContext('2d');

    // Start particle animation
    preParticles = [];
    animPreParticles();
    spawnPreParticles();

    // Animation timeline
    const tl = gsap.timeline();

    // Glow
    tl.to(dom.preGlow, { opacity: 0.6, scale: 3, duration: 2, ease: 'power1.inOut' }, 0);

    // Text 1
    tl.to(dom.preText1, {
        opacity: 1, y: 0, duration: 1.5, ease: 'power2.out',
    }, 1.5);

    // Text 2
    tl.to(dom.preText2, {
        opacity: 1, y: 0, duration: 1.5, ease: 'power2.out',
    }, 3.5);

    // Build glow
    tl.to(dom.preGlow, {
        opacity: 1, scale: 8, duration: 3, ease: 'power2.in',
    }, 6);

    // Flash to white then celebration
    tl.to(dom.preCelebration, {
        backgroundColor: '#fff', duration: 0.6, ease: 'power2.in',
    }, 9.2);

    tl.call(() => {
        startCelebration();
    }, [], 10);
}

function spawnPreParticles() {
    if (state.stage !== 'preCelebration') return;
    const c = dom.preCanvas;
    for (let i = 0; i < 3; i++) {
        preParticles.push({
            x: Math.random() * c.width,
            y: c.height + 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 2 + 1),
            r: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? '#ffd700' : '#ff8fbf',
            life: 1,
            decay: Math.random() * 0.005 + 0.003,
        });
    }
    setTimeout(spawnPreParticles, 100);
}

function animPreParticles() {
    if (state.stage === 'celebration') return;
    preCtx.clearRect(0, 0, dom.preCanvas.width, dom.preCanvas.height);
    for (let i = preParticles.length - 1; i >= 0; i--) {
        const p = preParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.1;
        p.life -= p.decay;
        if (p.life <= 0) { preParticles.splice(i, 1); continue; }
        preCtx.globalAlpha = p.life * 0.8;
        preCtx.beginPath();
        preCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        preCtx.fillStyle = p.color;
        preCtx.shadowBlur = 12;
        preCtx.shadowColor = p.color;
        preCtx.fill();
    }
    preCtx.globalAlpha = 1;
    preCtx.shadowBlur = 0;
    requestAnimationFrame(animPreParticles);
}

// ---- CELEBRATION ----
function startCelebration() {
    state.stage = 'celebration';
    dom.preCelebration.classList.remove('visible');
    dom.celebration.classList.add('visible');

    // Stop romantic, play celebration
    try { dom.romanticSound.pause(); } catch (e) {}
    audio.playCelebration();

    // Animate photo in
    gsap.to(dom.celebrationFrame, {
        scale: 1, opacity: 1,
        duration: 1.5, ease: 'elastic.out(1, 0.6)',
        delay: 0.3,
    });

    // Confetti bursts
    const colors = ['#ff4b6e', '#ffd700', '#ff8fbf', '#ff6b35', '#fff'];
    const fire = (opts) => {
        confetti({
            particleCount: 80,
            spread: 70,
            colors: colors,
            ...opts,
        });
    };

    // Staggered confetti
    setTimeout(() => fire({ angle: 60, origin: { x: 0, y: 0.7 } }), 300);
    setTimeout(() => fire({ angle: 120, origin: { x: 1, y: 0.7 } }), 500);
    setTimeout(() => fire({ angle: 90, origin: { x: 0.5, y: 0.8 }, particleCount: 120, spread: 100 }), 800);
    setTimeout(() => {
        fire({ angle: 60, origin: { x: 0.2, y: 0.9 }, particleCount: 60 });
        fire({ angle: 120, origin: { x: 0.8, y: 0.9 }, particleCount: 60 });
    }, 1500);
    setTimeout(() => {
        fire({ angle: 90, origin: { x: 0.5, y: 0.6 }, particleCount: 100, spread: 120 });
    }, 2500);

    // Continuous subtle confetti
    let confettiInterval = setInterval(() => {
        confetti({
            particleCount: 8,
            spread: 60,
            origin: { x: Math.random(), y: Math.random() * 0.4 },
            colors: colors,
            gravity: 0.8,
        });
    }, 400);

    setTimeout(() => clearInterval(confettiInterval), 15000);
}

// ---- INIT ----
function init() {
    initBgParticles();
    initCrackCanvas();

    dom.heartContainer.addEventListener('click', onHeartClick);
    dom.heartContainer.addEventListener('touchend', (e) => {
        e.preventDefault();
        onHeartClick();
    });

    // Pre-set elements
    gsap.set(dom.preText1, { y: 30 });
    gsap.set(dom.preText2, { y: 30 });
    gsap.set(dom.preGlow, { scale: 1 });

    // Resize handler
    window.addEventListener('resize', () => {
        dom.bgCanvas.width = window.innerWidth;
        dom.bgCanvas.height = window.innerHeight;
        dom.crackCanvas.width = window.innerWidth;
        dom.crackCanvas.height = window.innerHeight;
    });
}

init();
