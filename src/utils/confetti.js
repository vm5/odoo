import confetti from 'canvas-confetti';

const defaultColors = ['#7C4DFF', '#00E5FF', '#FFD700', '#FF69B4'];

export const triggerConfetti = (options = {}) => {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.7 },
    colors: defaultColors,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    ...options,
  });
};

export const triggerSchoolPride = () => {
  const end = Date.now() + 1000;

  // Animate confetti from both sides
  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: defaultColors,
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: defaultColors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerFireworks = () => {
  const duration = 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors: defaultColors,
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
    });
  }, 250);
}; 