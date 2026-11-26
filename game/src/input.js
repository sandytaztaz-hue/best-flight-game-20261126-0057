// input.js — keyboard and mouse, with edge detection (pressed this frame)
// so menus and the cargo-drop key never double-fire. One file, one job:
// read the player's hands, hand the game clean booleans.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, clicked: false, down: false };
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    // Losing the window must never leave a key stuck down.
    window.addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      this.mouse.clicked = true;
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
  }

  down(...codes) { return codes.some((c) => this.keys.has(c)); }
  hit(...codes) { return codes.some((c) => this.pressed.has(c)); }
  click() { return this.mouse.clicked; }

  // Mouse steer: hold the mouse and the plane banks toward the cursor.
  steerAxis() {
    if (!this.mouse.down) return 0;
    const dx = (this.mouse.x - 640) / 640;
    return Math.max(-1, Math.min(1, dx * 1.6));
  }

  endFrame() { this.pressed.clear(); this.mouse.clicked = false; }
}

// A clickable rectangle for menus. Returns true on the frame it is clicked.
export function button(input, x, y, w, h) {
  return input.click()
    && input.mouse.x >= x && input.mouse.x <= x + w
    && input.mouse.y >= y && input.mouse.y <= y + h;
}

// Keyboard shortcut helper: Space / Enter confirm on menus.
export function confirmPressed(input) {
  return input.hit('Space', 'Enter');
}
