/**
 * Cactus Sparks — Lightweight emoji particle system
 * Generates animated floating emoji sparks originating from click events
 */
export const triggerSpark = (e, emoji = '✨') => {
  const container = document.body;
  const count = 12; // number of particles
  
  // Resolve click coordinates
  let x = 0;
  let y = 0;
  
  if (e && e.clientX && e.clientY) {
    x = e.clientX;
    y = e.clientY;
  } else if (e && e.target) {
    const rect = e.target.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else {
    return;
  }

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.innerText = emoji;
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = `${Math.random() * 12 + 14}px`; // Random size between 14px and 26px
    el.style.pointerEvents = 'none';
    el.style.zIndex = '999999';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    
    // Spread in all directions
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 40; // Expand outward
    const destX = x + Math.cos(angle) * distance;
    const destY = y + Math.sin(angle) * distance - 30; // Float upwards slightly
    
    container.appendChild(el);
    
    // Frame step animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.left = `${destX}px`;
        el.style.top = `${destY}px`;
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(' + (Math.random() * 360 - 180) + 'deg)';
      }, 15);
    });
    
    // Remove from DOM
    setTimeout(() => {
      el.remove();
    }, 850);
  }
};
