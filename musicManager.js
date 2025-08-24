// Music Manager - Centralized music control for the portfolio site
class MusicManager {
  constructor() {
    this.backgroundMusic = null;
    this.hoverMusic = null;
    this.muteContainer = null;
    this.muteIcon = null;
    this.isPlaying = false;
    this.isHovering = false;
    this.userMuted = false; // Track user's explicit mute preference
    this.currentFadeInterval = null;
    
    // Force music to be ON by default - ignore saved preferences
    this.userMuted = false;
    console.log('Music forced ON by default - ignoring saved preferences');
    
    console.log('MusicManager initialized, userMuted:', this.userMuted);
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupMusic());
    } else {
      this.setupMusic();
    }
  }

  setupMusic() {
    this.backgroundMusic = document.getElementById('backgroundMusic');
    this.hoverMusic = document.getElementById('hoverMusic');
    this.muteContainer = document.getElementById('muteContainer');
    this.muteIcon = document.getElementById('muteIcon');

    console.log('Music elements found:', {
      backgroundMusic: !!this.backgroundMusic,
      hoverMusic: !!this.hoverMusic,
      muteContainer: !!this.muteContainer,
      muteIcon: !!this.muteIcon
    });

    if (!this.backgroundMusic || !this.muteContainer) {
      console.log('Music elements not found - backgroundMusic:', !!this.backgroundMusic, 'muteContainer:', !!this.muteContainer);
      return;
    }

    // Set initial volumes
    this.backgroundMusic.volume = 0.2;
    console.log('Background music loaded:', {
      src: this.backgroundMusic.src,
      readyState: this.backgroundMusic.readyState,
      volume: this.backgroundMusic.volume
    });
    
    if (this.hoverMusic) {
      this.hoverMusic.volume = 0;
      this.hoverMusic.currentTime = 25; // Start at 25 seconds
    }

    // Initialize mute icon to correct state
    this.updateMuteIcon();
    console.log('Music setup complete, icon initialized to:', this.userMuted ? 'muted' : 'playing');
    
    // For new visitors, ensure music starts playing
    if (!this.userMuted) {
      console.log('New visitor detected, attempting to start music');
    }

    // Setup event listeners
    this.setupEventListeners();
    
    // Restore music state from previous session
    this.restoreMusicState();
    
    // Start music immediately since it's forced ON
    if (!this.userMuted) {
      console.log('Music forced ON, starting immediately after user interaction');
    }
  }

  setupEventListeners() {
    // Music toggle
    this.muteContainer.addEventListener('click', () => this.toggleMusic());

    // Start music on first user interaction (click anywhere)
    document.addEventListener('click', (e) => {
      console.log('Click detected, checking music state:', {
        isPlaying: this.isPlaying,
        userMuted: this.userMuted,
        hasBackgroundMusic: !!this.backgroundMusic
      });
      
      if (!this.isPlaying && !this.userMuted && this.backgroundMusic) {
        console.log('First user interaction detected, starting music');
        this.startMusicOnInteraction();
      } else {
        console.log('Music not started because:', {
          isPlaying: this.isPlaying,
          userMuted: this.userMuted,
          hasBackgroundMusic: !!this.backgroundMusic
        });
      }
    }, { once: true });

    // Page visibility change - keep music playing regardless of tab switching
    document.addEventListener('visibilitychange', () => {
      console.log('Page visibility changed:', document.hidden ? 'hidden' : 'visible');
      // Don't pause/resume on tab switch - keep music playing
    });

    // Window focus - keep music playing
    window.addEventListener('focus', () => {
      console.log('Window focused - music should continue playing');
      // Don't change music state on focus
    });

    // Navigation hover effects (only on home page)
    this.setupHoverEffects();
  }

  setupHoverEffects() {
    const navContainer = document.querySelector('.bottom-nav');
    if (navContainer && this.hoverMusic) {
      navContainer.addEventListener('mouseenter', () => this.fadeToHover());
      navContainer.addEventListener('mouseleave', () => this.fadeToBackground());
    }
  }

  toggleMusic() {
    console.log('Toggle music called, current state:', { userMuted: this.userMuted, isPlaying: this.isPlaying });
    
    if (this.userMuted) {
      this.unmuteMusic();
    } else {
      this.muteMusic();
    }
  }

  muteMusic() {
    this.userMuted = true;
    this.isPlaying = false;
    this.pauseMusic();
    this.updateMuteIcon();
    
    // Store preference in localStorage
    localStorage.setItem('musicMuted', 'true');
    console.log('Music muted');
  }

  unmuteMusic() {
    this.userMuted = false;
    this.isPlaying = true;
    this.resumeMusic();
    this.updateMuteIcon();
    
    // Store preference in localStorage
    localStorage.setItem('musicMuted', 'false');
    console.log('Music unmuted');
  }

  pauseMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
    if (this.hoverMusic) {
      this.hoverMusic.pause();
    }
    this.isPlaying = false;
  }

  resumeMusic() {
    if (this.userMuted) return; // Don't resume if user muted
    
    if (this.backgroundMusic && this.backgroundMusic.volume > 0) {
      this.backgroundMusic.play().then(() => {
        this.isPlaying = true;
        console.log('Background music resumed');
      }).catch(e => {
        console.log('Background music resume failed:', e);
        this.isPlaying = false;
      });
    }
    if (this.hoverMusic && this.hoverMusic.volume > 0) {
      this.hoverMusic.play().then(() => {
        console.log('Hover music resumed');
      }).catch(e => {
        console.log('Hover music resume failed:', e);
      });
    }
  }

  updateMuteIcon() {
    if (!this.muteIcon) return;
    
    const mutedIcon = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    const playingIcon = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77z"/>`;
    
    // Show muted icon ONLY when user has muted
    // Show playing icon when user hasn't muted (regardless of isPlaying state)
    const shouldShowMutedIcon = this.userMuted;
    this.muteIcon.innerHTML = shouldShowMutedIcon ? mutedIcon : playingIcon;
    
    console.log('Icon updated to:', shouldShowMutedIcon ? 'muted' : 'playing', {
      userMuted: this.userMuted,
      isPlaying: this.isPlaying
    });
  }

  fadeToHover() {
    if (!this.isPlaying || this.isHovering || !this.hoverMusic) return;
    
    // Clear any existing fade interval
    if (this.currentFadeInterval) {
      clearInterval(this.currentFadeInterval);
      this.currentFadeInterval = null;
    }
    
    this.isHovering = true;
    
    // Start hover music if not already playing
    if (this.hoverMusic.paused) {
      this.hoverMusic.play().catch(e => console.log('Hover music play failed:', e));
    }
    
    // Fade out background, fade in hover
    this.currentFadeInterval = setInterval(() => {
      if (this.backgroundMusic.volume > 0) {
        this.backgroundMusic.volume = Math.max(0, this.backgroundMusic.volume - 0.05);
      }
      if (this.hoverMusic.volume < 0.5) {
        this.hoverMusic.volume = Math.min(0.5, this.hoverMusic.volume + 0.05);
      }
      
      if (this.backgroundMusic.volume <= 0 && this.hoverMusic.volume >= 0.5) {
        clearInterval(this.currentFadeInterval);
        this.currentFadeInterval = null;
      }
    }, 50);
  }

  fadeToBackground() {
    if (!this.isPlaying || !this.isHovering) return;
    
    // Clear any existing fade interval
    if (this.currentFadeInterval) {
      clearInterval(this.currentFadeInterval);
      this.currentFadeInterval = null;
    }
    
    this.isHovering = false;
    
    // Fade out hover, fade in background
    this.currentFadeInterval = setInterval(() => {
      if (this.hoverMusic.volume > 0) {
        this.hoverMusic.volume = Math.max(0, this.hoverMusic.volume - 0.05);
      }
      if (this.backgroundMusic.volume < 0.2) {
        this.backgroundMusic.volume = Math.min(0.2, this.backgroundMusic.volume + 0.05);
      }
      
      if (this.hoverMusic.volume <= 0 && this.backgroundMusic.volume >= 0.2) {
        clearInterval(this.currentFadeInterval);
        this.currentFadeInterval = null;
        this.hoverMusic.pause();
      }
    }, 50);
  }

  startMusicOnInteraction() {
    if (this.userMuted || this.isPlaying) {
      console.log('Music start blocked:', { userMuted: this.userMuted, isPlaying: this.isPlaying });
      return;
    }
    
    if (this.backgroundMusic) {
      console.log('Attempting to start music...');
      this.backgroundMusic.play().then(() => {
        this.isPlaying = true;
        this.updateMuteIcon();
        console.log('Music started successfully on user interaction');
      }).catch(e => {
        console.log('Music start failed:', e);
        this.isPlaying = false;
        // Try again after a short delay
        setTimeout(() => {
          if (!this.isPlaying && !this.userMuted) {
            console.log('Retrying music start...');
            this.startMusicOnInteraction();
          }
        }, 1000);
      });
    } else {
      console.log('No background music element found');
    }
  }

  attemptAutoStart() {
    if (this.userMuted) return; // Don't auto-start if user muted
    
    if (!this.isPlaying && this.backgroundMusic) {
      this.backgroundMusic.play().then(() => {
        this.isPlaying = true;
        this.updateMuteIcon();
        console.log('Music auto-started successfully');
      }).catch(e => {
        console.log('Auto-start failed, waiting for user interaction:', e);
        // Try again after any user interaction
        document.addEventListener('click', () => {
          if (!this.isPlaying && !this.userMuted) {
            this.toggleMusic();
          }
        }, { once: true });
      });
    }
  }

  // Public methods for external control
  setVolume(volume) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume() {
    return this.backgroundMusic ? this.backgroundMusic.volume : 0;
  }

  isMuted() {
    return this.userMuted;
  }

  // Handle page navigation - preserve music state
  handlePageNavigation() {
    // Save current state before navigation
    if (this.backgroundMusic) {
      localStorage.setItem('musicTime', this.backgroundMusic.currentTime);
      localStorage.setItem('musicVolume', this.backgroundMusic.volume);
    }
    
    // Ensure music is paused during navigation
    this.pauseMusic();
  }

  // Restore music state after navigation
  restoreMusicState() {
    // Restore volume
    if (this.backgroundMusic) {
      const savedVolume = localStorage.getItem('musicVolume');
      if (savedVolume) {
        this.backgroundMusic.volume = parseFloat(savedVolume);
      }
      
      // Restore time position
      const savedTime = localStorage.getItem('musicTime');
      if (savedTime) {
        this.backgroundMusic.currentTime = parseFloat(savedTime);
      }
    }
    
    // Update icon to reflect current state
    this.updateMuteIcon();
  }
}

// Initialize music manager when script loads
const musicManager = new MusicManager();

// TEMPORARY DEBUG: Add this to browser console to reset music state
// localStorage.removeItem('musicMuted'); location.reload();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicManager;
}
