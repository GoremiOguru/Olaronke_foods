/**
 * Global Scroll Manager for B'feastas
 * Prevents modal freeze / deadlock where document.body.style.overflow gets stuck on 'hidden'
 * Ensures user can always scroll smoothly after closing receipts, using counter handover, or printing.
 */

let activeLocks = 0;

export function lockScroll() {
  activeLocks++;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

export function unlockScroll() {
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.removeProperty('overflow');
    document.documentElement.style.overflow = '';
    document.documentElement.style.removeProperty('overflow');
  }
}

export function forceUnlockScroll() {
  activeLocks = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.removeProperty('overflow');
    document.documentElement.style.overflow = '';
    document.documentElement.style.removeProperty('overflow');
  }
}

// Global safety events: automatically release scroll if stuck after print dialog, window focus, or escape
if (typeof window !== 'undefined') {
  window.addEventListener('afterprint', () => {
    forceUnlockScroll();
  });

  window.addEventListener('focus', () => {
    // If no modal backdrop currently exists in the DOM, immediately unlock scroll
    setTimeout(() => {
      const hasModal = document.querySelector('.fixed.inset-0.z-50');
      if (!hasModal) {
        forceUnlockScroll();
      }
    }, 100);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setTimeout(() => {
        const hasModal = document.querySelector('.fixed.inset-0.z-50');
        if (!hasModal) {
          forceUnlockScroll();
        }
      }, 100);
    }
  });
}
