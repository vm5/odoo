import { useEffect } from 'react';
import soundEffects from '../../utils/soundEffects';
import { triggerConfetti, triggerFireworks, triggerSchoolPride } from '../../utils/confetti';

const MicroInteractions = () => {
  useEffect(() => {
    // Listen for custom events
    const handleInteraction = (event) => {
      const { type, data } = event.detail;

      switch (type) {
        case 'vote':
          soundEffects.play(data.isUpvote ? 'upvote' : 'downvote');
          break;
        case 'answer_accepted':
          soundEffects.play('achievement');
          triggerConfetti();
          break;
        case 'level_up':
          soundEffects.play('levelUp');
          triggerFireworks();
          break;
        case 'achievement_unlocked':
          soundEffects.play('achievement');
          triggerSchoolPride();
          break;
        case 'notification':
          soundEffects.play('notification');
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('microInteraction', handleInteraction);

    // Cleanup
    return () => {
      window.removeEventListener('microInteraction', handleInteraction);
    };
  }, []);

  // Helper function to trigger interactions
  const trigger = (type, data = {}) => {
    const event = new CustomEvent('microInteraction', {
      detail: { type, data },
    });
    window.dispatchEvent(event);
  };

  // Expose the trigger function globally
  window.triggerInteraction = trigger;

  return null; // This is a utility component, no UI needed
};

export default MicroInteractions;

// Usage examples:
/*
  // Trigger upvote interaction
  window.triggerInteraction('vote', { isUpvote: true });

  // Trigger achievement unlocked
  window.triggerInteraction('achievement_unlocked', { 
    achievement: '🧠 100+ IQ Posts' 
  });

  // Trigger level up
  window.triggerInteraction('level_up', { 
    newLevel: 'Code Wizard ⚡',
    xp: 1500 
  });
*/ 