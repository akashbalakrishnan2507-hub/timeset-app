/**
 * Logic Hunt - Ultra-Futuristic Stage Background Engine
 * High-definition interactive canvas featuring:
 * - Real PCB Circuit Busses with 45° chamfers & glowing Data Comets
 * - Procedurally drawn Logic Gates (AND, OR, XOR, NOT) with input/output signals
 * - Microchip IC Processors with pin arrays and blinking status LEDs
 * - "HUNT" Radar Sweep & Target Locking Reticles (algorithm searching)
 * - Logic Decision Diamonds (TRUE/FALSE branching)
 * - Floating Binary & Algorithmic Code Streams
 * - Center vignette for 100% timer readability
 */

class LogicHuntBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Engine entities
    this.circuits = [];
    this.dataComets = [];
    this.logicGates = [];
    this.microchips = [];
    this.targetLocks = [];
    this.radarAngle = 0;
    this.codeStreams = [];
    this.burstParticles = [];
    this.floatingSymbols = [];

    this.mouse = { x: -1000, y: -1000 };

    this.init();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  init() {
    this.resize();
    this.generateLayout();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
    this.ctx.scale(this.dpr, this.dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.generateLayout();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  generateLayout() {
    this.circuits = [];
    this.dataComets = [];
    this.logicGates = [];
    this.microchips = [];
    this.targetLocks = [];
    this.codeStreams = [];
    this.floatingSymbols = [];

    const w = this.width;
    const h = this.height;

    // 1. Create Microchips (IC Processors) in corners / peripheries
    const chipConfigs = [
      { x: w * 0.1, y: h * 0.22, label: 'ALU-CORE', w: 80, h: 56 },
      { x: w * 0.88, y: h * 0.26, label: 'LOGIC-HUNT', w: 90, h: 60 },
      { x: w * 0.12, y: h * 0.78, label: 'CPU-GATE', w: 76, h: 50 },
      { x: w * 0.86, y: h * 0.76, label: 'SYS-XOR', w: 82, h: 54 }
    ];

    chipConfigs.forEach(c => {
      this.microchips.push({
        ...c,
        pins: 6,
        ledTime: Math.random() * 10,
        activeColor: Math.random() > 0.5 ? '#00f0ff' : '#a855f7'
      });
    });

    // 2. Logic Gates placed strategically in non-center zones
    const gateTypes = ['AND', 'OR', 'XOR', 'NOT', 'NAND'];
    const gatePositions = [
      { x: w * 0.22, y: h * 0.28, type: 'AND', rot: 0 },
      { x: w * 0.26, y: h * 0.65, type: 'XOR', rot: 0 },
      { x: w * 0.76, y: h * 0.32, type: 'OR', rot: Math.PI },
      { x: w * 0.74, y: h * 0.68, type: 'NOT', rot: Math.PI },
      { x: w * 0.18, y: h * 0.48, type: 'OR', rot: 0 },
      { x: w * 0.82, y: h * 0.52, type: 'AND', rot: Math.PI }
    ];

    gatePositions.forEach((g, idx) => {
      this.logicGates.push({
        ...g,
        scale: 0.95,
        glowHue: idx % 2 === 0 ? '#00f0ff' : '#a855f7',
        pulse: Math.random() * Math.PI
      });
    });

    // 3. Realistic PCB Circuit Tracks with 45-degree chamfers
    const circuitCount = 18;
    for (let i = 0; i < circuitCount; i++) {
      const isLeft = i % 2 === 0;
      let curX = isLeft ? Math.random() * (w * 0.32) : w * 0.68 + Math.random() * (w * 0.3);
      let curY = Math.random() * h;

      const points = [{ x: curX, y: curY }];
      const segments = Math.floor(Math.random() * 4) + 3;

      for (let s = 0; s < segments; s++) {
        const stepType = Math.floor(Math.random() * 3);
        const len = Math.random() * 120 + 70;

        if (stepType === 0) {
          // Horizontal
          curX += isLeft ? len : -len;
        } else if (stepType === 1) {
          // Vertical
          curY += (Math.random() > 0.5 ? 1 : -1) * len;
        } else {
          // 45-degree chamfer
          const d = len * 0.7;
          curX += isLeft ? d : -d;
          curY += (Math.random() > 0.5 ? 1 : -1) * d;
        }

        // Avoid dead center
        if (Math.abs(curX - w / 2) < 220 && Math.abs(curY - h / 2) < 220) {
          curX = isLeft ? w * 0.25 : w * 0.75;
        }

        points.push({ x: curX, y: curY });
      }

      const colorHue = i % 2 === 0 ? '#00f0ff' : '#a855f7';
      this.circuits.push({
        points,
        color: i % 2 === 0 ? 'rgba(0, 240, 255, 0.16)' : 'rgba(168, 85, 247, 0.16)',
        glowColor: colorHue,
        lineWidth: i % 3 === 0 ? 2 : 1.2
      });

      // Data Comets shooting along circuits with long trailing heads
      for (let c = 0; c < 2; c++) {
        this.dataComets.push({
          circuitIdx: i,
          segmentIdx: 0,
          progress: Math.random(),
          speed: Math.random() * 0.007 + 0.004,
          glowColor: colorHue,
          length: Math.random() * 26 + 18,
          radius: Math.random() * 1.5 + 2
        });
      }
    }

    // 4. "HUNT" Targeting Reticles & Decision Nodes
    const targetCount = 6;
    for (let t = 0; t < targetCount; t++) {
      const isLeft = t % 2 === 0;
      this.targetLocks.push({
        x: isLeft ? Math.random() * (w * 0.28) + 40 : w * 0.72 + Math.random() * (w * 0.25),
        y: Math.random() * (h * 0.8) + h * 0.1,
        angle: Math.random() * Math.PI,
        spinSpeed: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 18 + 18,
        label: t % 2 === 0 ? 'HUNT://TARGET' : 'SEARCH://NODE',
        state: Math.random() > 0.5 ? 'LOCKED' : 'SCANNING',
        glow: t % 2 === 0 ? '#00f0ff' : '#38bdf8'
      });
    }

    // 5. Code & Logic Math Streams
    const logicCodeList = [
      'depth_first_hunt()',
      '0b10110010_1101',
      'XOR_CIPHER(key, flag)',
      'if (state === SOLVED)',
      'A ∧ (B ∨ C) ≡ (A ∧ B) ∨ (A ∧ C)',
      '¬(P ∧ Q) ≡ ¬P ∨ ¬Q',
      'assert(logic_path == true);',
      '0x7F_4A_9C',
      'find_shortest_tree()',
      'λx. (x ⊕ 1)',
      '1001 0110 1100 0011',
      'Q = (A ⊕ B) · C',
      'while(!discovered) { hunt(); }',
      'O(log N) SEARCH',
      'HASH_RESOLVE(0x3F)'
    ];

    for (let s = 0; s < 22; s++) {
      const isLeft = s % 2 === 0;
      this.codeStreams.push({
        text: logicCodeList[s % logicCodeList.length],
        x: isLeft ? Math.random() * (w * 0.32) + 20 : w * 0.68 + Math.random() * (w * 0.28),
        y: Math.random() * h,
        vy: -(Math.random() * 0.35 + 0.18),
        alpha: Math.random() * 0.3 + 0.1,
        color: s % 3 === 0 ? '#38bdf8' : s % 3 === 1 ? '#c084fc' : '#00f0ff',
        size: Math.floor(Math.random() * 3) + 11
      });
    }

    // 6. Floating Logic Math Glyphs
    const glyphs = ['⊕', '∧', '∨', '¬', '⊨', 'λ', '⊼', '⊽', '∫', '∑', '0', '1', '∅', '↔', '⇒'];
    for (let g = 0; g < 28; g++) {
      this.floatingSymbols.push({
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.25 + 0.08,
        color: Math.random() > 0.4 ? '#00f0ff' : '#a855f7',
        size: Math.floor(Math.random() * 8) + 14
      });
    }
  }

  // Draw Logic Gate (AND, OR, XOR, NOT)
  drawLogicGate(x, y, type, rot, scale, glowHue, pulse) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rot);
    this.ctx.scale(scale, scale);

    const glowAlpha = 0.65 + Math.sin(pulse) * 0.25;
    this.ctx.shadowColor = glowHue;
    this.ctx.shadowBlur = 10 * glowAlpha;
    this.ctx.strokeStyle = glowHue;
    this.ctx.lineWidth = 1.8;
    this.ctx.fillStyle = 'rgba(6, 11, 25, 0.75)';

    // Input/Output Wires
    this.ctx.beginPath();
    this.ctx.moveTo(-32, -10);
    this.ctx.lineTo(-18, -10);
    this.ctx.moveTo(-32, 10);
    this.ctx.lineTo(-18, 10);
    this.ctx.moveTo(22, 0);
    this.ctx.lineTo(36, 0);
    this.ctx.stroke();

    // Body
    this.ctx.beginPath();
    if (type === 'AND') {
      // D shape
      this.ctx.moveTo(-18, -18);
      this.ctx.lineTo(2, -18);
      this.ctx.arc(2, 0, 18, -Math.PI / 2, Math.PI / 2);
      this.ctx.lineTo(-18, 18);
      this.ctx.closePath();
    } else if (type === 'OR' || type === 'NOR') {
      // Shield curve shape
      this.ctx.moveTo(-18, -18);
      this.ctx.quadraticCurveTo(0, -18, 20, 0);
      this.ctx.quadraticCurveTo(0, 18, -18, 18);
      this.ctx.quadraticCurveTo(-10, 0, -18, -18);
      this.ctx.closePath();
    } else if (type === 'XOR') {
      // Extra back curve
      this.ctx.moveTo(-24, -18);
      this.ctx.quadraticCurveTo(-16, 0, -24, 18);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(-18, -18);
      this.ctx.quadraticCurveTo(0, -18, 20, 0);
      this.ctx.quadraticCurveTo(0, 18, -18, 18);
      this.ctx.quadraticCurveTo(-10, 0, -18, -18);
      this.ctx.closePath();
    } else if (type === 'NOT') {
      // Triangle + bubble
      this.ctx.moveTo(-18, -16);
      this.ctx.lineTo(12, 0);
      this.ctx.lineTo(-18, 16);
      this.ctx.closePath();
    }
    this.ctx.fill();
    this.ctx.stroke();

    // NOT bubble if needed
    if (type === 'NOT' || type === 'NAND' || type === 'NOR') {
      this.ctx.beginPath();
      this.ctx.arc(type === 'NOT' ? 16 : 22, 0, 3.5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Type Label
    this.ctx.font = "700 9px 'Orbitron', monospace";
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(type, 0, 1);

    this.ctx.restore();
  }

  // Draw Microchip IC Unit
  drawMicrochip(chip) {
    const { x, y, label, w, h, pins, activeColor } = chip;
    this.ctx.save();
    this.ctx.translate(x, y);

    // Chip Body
    this.ctx.fillStyle = 'rgba(10, 17, 34, 0.88)';
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    this.ctx.lineWidth = 1.4;
    this.ctx.shadowColor = activeColor;
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Pin Leads (top and bottom)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 2;
    const pinSpacing = w / (pins + 1);
    for (let p = 1; p <= pins; p++) {
      const px = -w / 2 + p * pinSpacing;
      // Top pins
      this.ctx.beginPath();
      this.ctx.moveTo(px, -h / 2);
      this.ctx.lineTo(px, -h / 2 - 6);
      this.ctx.stroke();
      // Bottom pins
      this.ctx.beginPath();
      this.ctx.moveTo(px, h / 2);
      this.ctx.lineTo(px, h / 2 + 6);
      this.ctx.stroke();
    }

    // Chip Label
    this.ctx.font = "800 8.5px 'Orbitron', monospace";
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, 0, -3);

    // Blinking Status LED
    chip.ledTime += 0.05;
    const isLedOn = Math.sin(chip.ledTime) > 0.2;
    this.ctx.fillStyle = isLedOn ? activeColor : 'rgba(255, 255, 255, 0.15)';
    this.ctx.shadowBlur = isLedOn ? 10 : 0;
    this.ctx.beginPath();
    this.ctx.arc(w / 2 - 10, h / 2 - 10, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Draw Logic Hunt Reticle
  drawTargetLock(t) {
    this.ctx.save();
    this.ctx.translate(t.x, t.y);
    t.angle += t.spinSpeed;
    this.ctx.rotate(t.angle);

    this.ctx.strokeStyle = t.glow;
    this.ctx.shadowColor = t.glow;
    this.ctx.shadowBlur = 8;
    this.ctx.lineWidth = 1.2;

    const s = t.size;
    // Corner brackets
    const b = 6;
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(-s, -s + b);
    this.ctx.lineTo(-s, -s);
    this.ctx.lineTo(-s + b, -s);
    // Top-right
    this.ctx.moveTo(s - b, -s);
    this.ctx.lineTo(s, -s);
    this.ctx.lineTo(s, -s + b);
    // Bottom-right
    this.ctx.moveTo(s, s - b);
    this.ctx.lineTo(s, s);
    this.ctx.lineTo(s - b, s);
    // Bottom-left
    this.ctx.moveTo(-s + b, s);
    this.ctx.lineTo(-s, s);
    this.ctx.lineTo(-s, s - b);
    this.ctx.stroke();

    // Center cross
    this.ctx.beginPath();
    this.ctx.moveTo(-3, 0);
    this.ctx.lineTo(3, 0);
    this.ctx.moveTo(0, -3);
    this.ctx.lineTo(0, 3);
    this.ctx.stroke();

    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    this.ctx.setLineDash([3, 4]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Subtitle label
    this.ctx.rotate(-t.angle);
    this.ctx.font = "700 8px 'Rajdhani', sans-serif";
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(t.label, 0, s + 13);

    this.ctx.restore();
  }

  // Trigger high-intensity particle burst for START! or TIME'S UP!
  triggerExplosion(x, y, count = 150, colors = ['#00f0ff', '#a855f7', '#ffffff', '#38bdf8']) {
    const originX = x !== undefined ? x : this.width / 2;
    const originY = y !== undefined ? y : this.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 13 + 2;
      this.burstParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: Math.random() > 0.5 ? 'square' : 'circle'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Deep Midnight Cyber Gradient
    const bgGrad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 60,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.72
    );
    bgGrad.addColorStop(0, '#0a1228');
    bgGrad.addColorStop(0.5, '#050917');
    bgGrad.addColorStop(1, '#020308');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Slow Futuristic Hex Grid & Tech Lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.022)';
    this.ctx.lineWidth = 1;
    const gridSize = 56;
    this.ctx.beginPath();
    for (let x = 0; x <= this.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    // 3. Subtle "HUNT" Radar Sweep Sensor Line in Background
    this.radarAngle += 0.008;
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    const radarGrad = this.ctx.createRadialGradient(0, 0, 20, 0, 0, Math.max(this.width, this.height) * 0.5);
    radarGrad.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
    radarGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.02)');
    radarGrad.addColorStop(1, 'transparent');

    this.ctx.rotate(this.radarAngle);
    this.ctx.fillStyle = radarGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, Math.max(this.width, this.height) * 0.5, 0, Math.PI / 4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // 4. Draw PCB Circuit Board Tracks with Solder Pads
    this.circuits.forEach(c => {
      if (c.points.length < 2) return;
      this.ctx.strokeStyle = c.color;
      this.ctx.lineWidth = c.lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let i = 1; i < c.points.length; i++) {
        this.ctx.lineTo(c.points[i].x, c.points[i].y);
      }
      this.ctx.stroke();

      // Golden / Cyan Solder Joints (Via holes)
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      c.points.forEach((pt, pIdx) => {
        if (pIdx === 0 || pIdx === c.points.length - 1) {
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
    });

    // 5. Data Comets with Glowing Heads & Gradient Tail (Signal Travel)
    this.dataComets.forEach(dc => {
      const circuit = this.circuits[dc.circuitIdx];
      if (!circuit || circuit.points.length < 2) return;

      const p1 = circuit.points[dc.segmentIdx];
      const p2 = circuit.points[dc.segmentIdx + 1];

      if (!p1 || !p2) {
        dc.segmentIdx = 0;
        dc.progress = 0;
        return;
      }

      dc.progress += dc.speed;
      if (dc.progress >= 1) {
        dc.progress = 0;
        dc.segmentIdx++;
        if (dc.segmentIdx >= circuit.points.length - 1) {
          dc.segmentIdx = 0;
        }
      }

      const curX = p1.x + (p2.x - p1.x) * dc.progress;
      const curY = p1.y + (p2.y - p1.y) * dc.progress;

      // Draw Glowing Head
      this.ctx.save();
      this.ctx.shadowColor = dc.glowColor;
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, dc.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw Comet Tail line
      const dirX = p2.x - p1.x;
      const dirY = p2.y - p1.y;
      const segLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      const tailX = curX - (dirX / segLen) * dc.length;
      const tailY = curY - (dirY / segLen) * dc.length;

      const cometGrad = this.ctx.createLinearGradient(curX, curY, tailX, tailY);
      cometGrad.addColorStop(0, dc.glowColor);
      cometGrad.addColorStop(1, 'transparent');
      this.ctx.strokeStyle = cometGrad;
      this.ctx.lineWidth = dc.radius * 1.6;
      this.ctx.beginPath();
      this.ctx.moveTo(curX, curY);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // 6. Draw Microchips
    this.microchips.forEach(chip => this.drawMicrochip(chip));

    // 7. Draw Logic Gates (AND, OR, XOR, NOT)
    this.logicGates.forEach(g => {
      g.pulse += 0.04;
      this.drawLogicGate(g.x, g.y, g.type, g.rot, g.scale, g.glowHue, g.pulse);
    });

    // 8. Draw Target Lock Reticles ("Logic Hunt")
    this.targetLocks.forEach(t => this.drawTargetLock(t));

    // 9. Floating Algorithmic Code Streams
    this.ctx.save();
    this.codeStreams.forEach(cs => {
      cs.y += cs.vy;
      if (cs.y < -30) {
        cs.y = this.height + 30;
        cs.x = (cs.x > this.width / 2) 
          ? this.width * 0.68 + Math.random() * (this.width * 0.28)
          : Math.random() * (this.width * 0.32) + 20;
      }

      this.ctx.font = `600 ${cs.size}px 'JetBrains Mono', monospace`;
      this.ctx.fillStyle = cs.color;
      this.ctx.globalAlpha = cs.alpha;
      this.ctx.shadowColor = cs.color;
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(cs.text, cs.x, cs.y);
    });
    this.ctx.restore();

    // 10. Floating Logic Mathematical Glyphs (⊕, ∧, ∨, ¬, λ, etc.)
    this.ctx.save();
    this.floatingSymbols.forEach(fs => {
      fs.x += fs.vx;
      fs.y += fs.vy;

      if (fs.x < 0) fs.x = this.width;
      if (fs.x > this.width) fs.x = 0;
      if (fs.y < 0) fs.y = this.height;
      if (fs.y > this.height) fs.y = 0;

      this.ctx.font = `800 ${fs.size}px 'Orbitron', sans-serif`;
      this.ctx.fillStyle = fs.color;
      this.ctx.globalAlpha = fs.alpha;
      this.ctx.shadowColor = fs.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(fs.char, fs.x, fs.y);
    });
    this.ctx.restore();

    // 11. Center Vignette Mask: Guarantees Timer is 100% Crisp & High-Contrast
    const centerVignette = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 110,
      this.width / 2, this.height / 2, 480
    );
    centerVignette.addColorStop(0, 'rgba(3, 7, 18, 0.72)');
    centerVignette.addColorStop(0.65, 'rgba(3, 7, 18, 0.4)');
    centerVignette.addColorStop(1, 'rgba(3, 7, 18, 0)');
    this.ctx.fillStyle = centerVignette;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 12. Explosion Particles (for START! and TIME'S UP)
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const p = this.burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(p.alpha, 0);
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 14;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

window.LogicHuntBackground = LogicHuntBackground;
