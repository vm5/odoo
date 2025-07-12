// Sound effect URLs (replace with actual sound files)
const SOUND_URLS = {
  upvote: '/sounds/upvote.mp3',
  downvote: '/sounds/downvote.mp3',
  achievement: '/sounds/achievement.mp3',
  levelUp: '/sounds/levelup.mp3',
  notification: '/sounds/notification.mp3',
};

class SoundEffects {
  constructor() {
    this.enabled = localStorage.getItem('soundEffects') !== 'false';
    this.sounds = {};
    this.loadSounds();
  }

  loadSounds() {
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      this.sounds[key] = new Audio(url);
      this.sounds[key].preload = 'auto';
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEffects', this.enabled);
  }

  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    // Stop any currently playing sound
    this.sounds[soundName].currentTime = 0;
    
    // Play the sound
    this.sounds[soundName].play().catch(error => {
      console.warn('Sound playback failed:', error);
    });
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new SoundEffects(); 