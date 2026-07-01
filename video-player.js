// Premium Shared Video Player Component for AI-OS
// Powered by A.R. Labs

(function() {
  // Inject Premium Video Player Styles
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* Premium Video Player Overlay */
    .premium-player-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(5, 5, 8, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: 'Outfit', sans-serif;
    }
    
    .premium-player-overlay.active {
      opacity: 1;
    }
    
    .premium-player-container {
      width: 90%;
      max-width: 960px;
      aspect-ratio: 16/9;
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(46, 197, 255, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .premium-player-overlay.active .premium-player-container {
      transform: scale(1);
    }
    
    /* Video Element wrapper */
    .premium-video-wrapper {
      position: relative;
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .premium-video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    /* Header Area */
    .premium-player-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding: 20px 24px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    .premium-player-title {
      font-family: 'Space Grotesk', monospace;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .premium-player-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 1.5rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      line-height: 1;
    }
    
    .premium-player-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
    
    /* Big Play/Pause Overlay */
    .premium-video-state-icon {
      position: absolute;
      width: 70px;
      height: 70px;
      background: rgba(46, 197, 255, 0.2);
      border: 1px solid rgba(46, 197, 255, 0.4);
      color: #2EC5FF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 5;
    }
    
    .premium-video-state-icon.trigger {
      animation: rippleEffect 0.5s ease forwards;
    }
    
    @keyframes rippleEffect {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0; transform: scale(1.2); }
    }
    
    /* Controls Bar Area */
    .premium-player-controls-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 24px 24px 16px 24px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%);
      display: flex;
      flex-direction: column;
      gap: 14px;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    /* Timeline scrubber styling */
    .premium-scrubber-wrapper {
      position: relative;
      width: 100%;
      height: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    
    .premium-scrubber-rail {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
    
    .premium-scrubber-buffered {
      position: absolute;
      height: 100%;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 2px;
      width: 0%;
      transition: width 0.2s ease;
    }
    
    .premium-scrubber-progress {
      position: absolute;
      height: 100%;
      background: linear-gradient(90deg, #2EC5FF 0%, #00D084 100%);
      border-radius: 2px;
      width: 0%;
    }
    
    .premium-scrubber-handler {
      position: absolute;
      left: 0%;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      transform: translateX(-50%);
      box-shadow: 0 0 10px rgba(46, 197, 255, 0.8);
      opacity: 0;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    
    .premium-scrubber-wrapper:hover .premium-scrubber-handler {
      opacity: 1;
      transform: translateX(-50%) scale(1.2);
    }
    
    .premium-scrubber-wrapper:hover {
      height: 6px;
    }
    
    /* Control buttons row */
    .premium-controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .premium-controls-left,
    .premium-controls-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .premium-player-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.85);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .premium-player-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }
    
    .premium-player-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    
    /* Time counter */
    .premium-time-counter {
      font-family: 'Space Grotesk', monospace;
      color: rgba(255,255,255,0.75);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }
    
    /* Volume container */
    .premium-volume-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .premium-volume-slider {
      width: 60px;
      height: 3px;
      background: rgba(255,255,255,0.25);
      position: relative;
      cursor: pointer;
      border-radius: 2px;
      display: flex;
      align-items: center;
    }
    
    .premium-volume-level {
      height: 100%;
      background: #2EC5FF;
      width: 100%;
      border-radius: 2px;
    }
    
    .premium-volume-handle {
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      left: 100%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    
    .premium-volume-wrap:hover .premium-volume-handle {
      opacity: 1;
    }
    
    .premium-volume-wrap:hover .premium-volume-slider {
      height: 5px;
    }
    
    /* Speed Control menu */
    .premium-speed-selector {
      position: relative;
    }
    
    .premium-speed-btn {
      font-family: 'Space Grotesk', monospace;
      font-size: 0.78rem;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 4px 8px;
      background: rgba(255,255,255,0.05);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .premium-speed-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.4);
    }
    
    .premium-speed-menu {
      position: absolute;
      bottom: 40px;
      right: 0;
      background: #121216;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      width: 80px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 6px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.5);
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 12;
    }
    
    .premium-speed-menu.active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    
    .premium-speed-item {
      font-family: 'Space Grotesk', monospace;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 0.75rem;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }
    
    .premium-speed-item:hover,
    .premium-speed-item.active {
      color: var(--accent-cyan, #2EC5FF);
      background: rgba(255,255,255,0.05);
    }
    
    /* Resume Position Alert Modal */
    .premium-resume-alert {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: rgba(18, 18, 22, 0.9);
      border: 1px solid rgba(46, 197, 255, 0.25);
      border-radius: 12px;
      padding: 24px;
      z-index: 20;
      text-align: center;
      width: 320px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .premium-resume-alert.active {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
    }
    
    .premium-resume-title {
      font-family: 'Space Grotesk', monospace;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 8px;
    }
    
    .premium-resume-desc {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 18px;
    }
    
    .premium-resume-btns {
      display: flex;
      gap: 10px;
    }
    
    .premium-resume-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border-color, rgba(255,255,255,0.1));
      font-family: 'Space Grotesk', monospace;
      transition: all 0.15s ease;
    }
    
    .premium-resume-btn.accept {
      background: linear-gradient(135deg, #2EC5FF 0%, #00D084 100%);
      color: #000;
      border: none;
      font-weight: 700;
    }
    
    .premium-resume-btn.accept:hover {
      box-shadow: 0 0 10px rgba(46, 197, 255, 0.4);
    }
    
    .premium-resume-btn.cancel {
      background: transparent;
      color: #fff;
    }
    
    .premium-resume-btn.cancel:hover {
      background: rgba(255,255,255,0.05);
    }
    
    /* Double tap indicator ripples */
    .double-tap-ripple {
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      pointer-events: none;
      z-index: 4;
      opacity: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-family: 'Space Grotesk', monospace;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .double-tap-ripple.left {
      left: 0;
    }
    
    .double-tap-ripple.right {
      right: 0;
    }
    
    .double-tap-ripple.trigger {
      animation: tapRipple 0.5s ease-out;
    }
    
    @keyframes tapRipple {
      0% { opacity: 0; transform: scale(0.6); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.1); }
    }
    
    /* Hide Controls state class */
    .premium-player-container.hide-interface {
      cursor: none;
    }
    
    .premium-player-container.hide-interface .premium-player-header,
    .premium-player-container.hide-interface .premium-player-controls-bar {
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleEl);

  // HTML Markup for the Player Modal
  const playerMarkup = `
    <div id="premium-player-overlay" class="premium-player-overlay">
      <div class="premium-player-container" id="premium-player-container">
        
        <!-- Header -->
        <div class="premium-player-header">
          <span class="premium-player-title" id="premium-player-title">AI-OS Premium Lecture</span>
          <button class="premium-player-close" id="premium-player-close" title="Close Player">&times;</button>
        </div>
        
        <!-- Video Wrapper -->
        <div class="premium-video-wrapper" id="premium-video-wrapper">
          <video class="premium-video-element" id="premium-video-element" playsinline></video>
          
          <!-- Big Central Action Ripple Indicator -->
          <div class="premium-video-state-icon" id="premium-video-state-icon">
            <span>▶</span>
          </div>
          
          <!-- Double Tap Overlay Ripples -->
          <div class="double-tap-ripple left" id="double-tap-ripple-left">◀◀ -10s</div>
          <div class="double-tap-ripple right" id="double-tap-ripple-right">+10s ▶▶</div>
          
          <!-- Resume Position Dialog -->
          <div class="premium-resume-alert" id="premium-resume-alert">
            <h4 class="premium-resume-title">Resume Learning?</h4>
            <p class="premium-resume-desc" id="premium-resume-desc">Do you want to continue watching from where you left off?</p>
            <div class="premium-resume-btns">
              <button class="premium-resume-btn cancel" id="btn-resume-restart">Start Over</button>
              <button class="premium-resume-btn accept" id="btn-resume-accept">Resume</button>
            </div>
          </div>
        </div>
        
        <!-- Controls Bar -->
        <div class="premium-player-controls-bar" id="premium-player-controls-bar">
          
          <!-- Scrubber Timeline -->
          <div class="premium-scrubber-wrapper" id="premium-scrubber-wrapper">
            <div class="premium-scrubber-rail"></div>
            <div class="premium-scrubber-buffered" id="premium-scrubber-buffered"></div>
            <div class="premium-scrubber-progress" id="premium-scrubber-progress"></div>
            <div class="premium-scrubber-handler" id="premium-scrubber-handler"></div>
          </div>
          
          <!-- Buttons Row -->
          <div class="premium-controls-row">
            
            <div class="premium-controls-left">
              <!-- Play/Pause -->
              <button class="premium-player-btn" id="premium-play-btn" title="Play (Space)">
                <svg viewBox="0 0 24 24" id="play-icon-svg"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <svg viewBox="0 0 24 24" id="pause-icon-svg" style="display:none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
              
              <!-- Volume Toggle & Slider -->
              <div class="premium-volume-wrap">
                <button class="premium-player-btn" id="premium-mute-btn" title="Mute (M)">
                  <svg viewBox="0 0 24 24" id="volume-high-svg"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  <svg viewBox="0 0 24 24" id="volume-mute-svg" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                </button>
                <div class="premium-volume-slider" id="premium-volume-slider">
                  <div class="premium-volume-level" id="premium-volume-level"></div>
                  <div class="premium-volume-handle" id="premium-volume-handle"></div>
                </div>
              </div>
              
              <!-- Time counter -->
              <span class="premium-time-counter">
                <span id="premium-current-time">0:00</span> / <span id="premium-duration-time">0:00</span>
              </span>
            </div>
            
            <div class="premium-controls-right">
              <!-- Playback Speed -->
              <div class="premium-speed-selector">
                <button class="premium-speed-btn" id="premium-speed-btn">1.0x</button>
                <div class="premium-speed-menu" id="premium-speed-menu">
                  <button class="premium-speed-item" data-speed="0.5">0.5x</button>
                  <button class="premium-speed-item" data-speed="0.75">0.75x</button>
                  <button class="premium-speed-item active" data-speed="1.0">1.0x</button>
                  <button class="premium-speed-item" data-speed="1.25">1.25x</button>
                  <button class="premium-speed-item" data-speed="1.5">1.5x</button>
                  <button class="premium-speed-item" data-speed="2.0">2.0x</button>
                </div>
              </div>
              
              <!-- Picture-in-Picture -->
              <button class="premium-player-btn" id="premium-pip-btn" title="Picture in Picture">
                <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13" y="11" width="7" height="7" rx="1" ry="1"></rect></svg>
              </button>
              
              <!-- Fullscreen -->
              <button class="premium-player-btn" id="premium-fullscreen-btn" title="Fullscreen (F)">
                <svg viewBox="0 0 24 24" id="fullscreen-enter-svg"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <svg viewBox="0 0 24 24" id="fullscreen-exit-svg" style="display:none;"><path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  `;

  // Append markup to body
  const parser = new DOMParser();
  const playerDoc = parser.parseFromString(playerMarkup, 'text/html');
  const overlayNode = playerDoc.getElementById('premium-player-overlay');
  document.body.appendChild(overlayNode);

  // Capture DOM bindings
  const overlay = document.getElementById('premium-player-overlay');
  const container = document.getElementById('premium-player-container');
  const video = document.getElementById('premium-video-element');
  if (video) {
    video.addEventListener('contextmenu', e => e.preventDefault());
    video.setAttribute('controlsList', 'nodownload noRemotePlayback');
    video.setAttribute('disablePictureInPicture', 'true');
  }
  const closeBtn = document.getElementById('premium-player-close');
  const wrapper = document.getElementById('premium-video-wrapper');
  const stateIcon = document.getElementById('premium-video-state-icon');
  
  const playBtn = document.getElementById('premium-play-btn');
  const playSvg = document.getElementById('play-icon-svg');
  const pauseSvg = document.getElementById('pause-icon-svg');
  
  const muteBtn = document.getElementById('premium-mute-btn');
  const muteHighSvg = document.getElementById('volume-high-svg');
  const muteOffSvg = document.getElementById('volume-mute-svg');
  
  const volumeSlider = document.getElementById('premium-volume-slider');
  const volumeLevel = document.getElementById('premium-volume-level');
  const volumeHandle = document.getElementById('premium-volume-handle');
  
  const scrubberWrap = document.getElementById('premium-scrubber-wrapper');
  const scrubberProgress = document.getElementById('premium-scrubber-progress');
  const scrubberBuffered = document.getElementById('premium-scrubber-buffered');
  const scrubberHandler = document.getElementById('premium-scrubber-handler');
  
  const currentTimeDisplay = document.getElementById('premium-current-time');
  const durationDisplay = document.getElementById('premium-duration-time');
  const speedBtn = document.getElementById('premium-speed-btn');
  const speedMenu = document.getElementById('premium-speed-menu');
  const pipBtn = document.getElementById('premium-pip-btn');
  const fullscreenBtn = document.getElementById('premium-fullscreen-btn');
  const fullscreenEnterSvg = document.getElementById('fullscreen-enter-svg');
  const fullscreenExitSvg = document.getElementById('fullscreen-exit-svg');
  
  const resumeAlert = document.getElementById('premium-resume-alert');
  const resumeDesc = document.getElementById('premium-resume-desc');
  const resumeRestartBtn = document.getElementById('btn-resume-restart');
  const resumeAcceptBtn = document.getElementById('btn-resume-accept');
  
  const doubleTapLeft = document.getElementById('double-tap-ripple-left');
  const doubleTapRight = document.getElementById('double-tap-ripple-right');

  // Local state properties
  let hideControlsTimeout = null;
  let activeVideoPath = '';
  let resumeTimestamp = 0;
  let saveInterval = null;
  let doubleTapTimeout = null;
  let tapCount = 0;
  
  // Format utility
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Toggle Play / Pause
  function togglePlay() {
    if (video.paused) {
      video.play();
      showStateIcon('▶');
    } else {
      video.pause();
      showStateIcon('❚❚');
    }
  }

  function showStateIcon(char) {
    stateIcon.querySelector('span').textContent = char;
    stateIcon.classList.remove('trigger');
    void stateIcon.offsetWidth; // Trigger reflow
    stateIcon.classList.add('trigger');
  }

  // Close Player handler
  function closePlayer() {
    clearInterval(saveInterval);
    video.pause();
    
    // Save state on close
    saveProgress();
    
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      video.src = '';
    }, 300);
    
    // Release fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  // Playback State update (UI)
  video.addEventListener('play', () => {
    playSvg.style.display = 'none';
    pauseSvg.style.display = 'block';
    startControlsTimeout();
  });

  video.addEventListener('pause', () => {
    playSvg.style.display = 'block';
    pauseSvg.style.display = 'none';
    clearTimeout(hideControlsTimeout);
    container.classList.remove('hide-interface');
  });

  // Load Metadata & Seek progress
  video.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(video.duration);
    
    // Check local progress
    const savedTime = localStorage.getItem(`aios_video_resume_${activeVideoPath}`);
    if (savedTime && parseFloat(savedTime) > 3 && parseFloat(savedTime) < video.duration - 5) {
      resumeTimestamp = parseFloat(savedTime);
      resumeDesc.textContent = `Do you want to continue watching from ${formatTime(resumeTimestamp)}?`;
      resumeAlert.classList.add('active');
    } else {
      video.play();
    }
  });

  // Track progress bar & Buffer states
  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      scrubberProgress.style.width = `${pct}%`;
      scrubberHandler.style.left = `${pct}%`;
      currentTimeDisplay.textContent = formatTime(video.currentTime);
    }
    
    // Render buffered chunks
    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1);
      const pct = (end / video.duration) * 100;
      scrubberBuffered.style.width = `${pct}%`;
    }
  });

  // Progress Bar click seek
  function seekVideo(e) {
    const rect = scrubberWrap.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  }
  
  scrubberWrap.addEventListener('click', seekVideo);
  
  // Scrubber drag handlers
  let isDraggingScrubber = false;
  scrubberWrap.addEventListener('mousedown', () => { isDraggingScrubber = true; });
  window.addEventListener('mouseup', () => { isDraggingScrubber = false; });
  window.addEventListener('mousemove', (e) => {
    if (isDraggingScrubber && video.duration) {
      const rect = scrubberWrap.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      video.currentTime = pos * video.duration;
    }
  });

  // Volume slider handlers
  function setVolume(val) {
    video.volume = val;
    volumeLevel.style.width = `${val * 100}%`;
    volumeHandle.style.left = `${val * 100}%`;
    
    if (val === 0) {
      muteHighSvg.style.display = 'none';
      muteOffSvg.style.display = 'block';
    } else {
      muteHighSvg.style.display = 'block';
      muteOffSvg.style.display = 'none';
    }
  }

  function handleVolumeClick(e) {
    const rect = volumeSlider.getBoundingClientRect();
    let val = (e.clientX - rect.left) / rect.width;
    val = Math.max(0, Math.min(1, val));
    setVolume(val);
  }
  
  volumeSlider.addEventListener('click', handleVolumeClick);

  let isDraggingVolume = false;
  volumeSlider.addEventListener('mousedown', () => { isDraggingVolume = true; });
  window.addEventListener('mouseup', () => { isDraggingVolume = false; });
  window.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) {
      const rect = volumeSlider.getBoundingClientRect();
      let val = (e.clientX - rect.left) / rect.width;
      val = Math.max(0, Math.min(1, val));
      setVolume(val);
    }
  });

  // Mute / Unmute
  muteBtn.addEventListener('click', () => {
    if (video.volume > 0) {
      video.dataset.prevVolume = video.volume;
      setVolume(0);
    } else {
      const prev = parseFloat(video.dataset.prevVolume || '1.0');
      setVolume(prev);
    }
  });

  // Fullscreen implementation
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        fullscreenEnterSvg.style.display = 'none';
        fullscreenExitSvg.style.display = 'block';
      }).catch(err => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      fullscreenEnterSvg.style.display = 'block';
      fullscreenExitSvg.style.display = 'none';
    }
  }
  
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Picture-in-Picture logic
  pipBtn.addEventListener('click', () => {
    if (!document.pictureInPictureElement) {
      video.requestPictureInPicture().catch(err => {
        console.error("Error setting PiP mode:", err);
      });
    } else {
      document.exitPictureInPicture();
    }
  });

  // Playback speeds dropdown
  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speedMenu.classList.toggle('active');
  });

  document.querySelectorAll('.premium-speed-item').forEach(item => {
    item.addEventListener('click', () => {
      const spd = parseFloat(item.getAttribute('data-speed'));
      video.playbackRate = spd;
      speedBtn.textContent = `${spd.toFixed(1)}x`;
      
      document.querySelectorAll('.premium-speed-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      speedMenu.classList.remove('active');
    });
  });

  // Hide speed menu on clicking outside
  window.addEventListener('click', () => {
    speedMenu.classList.remove('active');
  });

  // Auto Hide Controls bar on idle
  function startControlsTimeout() {
    clearTimeout(hideControlsTimeout);
    container.classList.remove('hide-interface');
    if (!video.paused) {
      hideControlsTimeout = setTimeout(() => {
        container.classList.add('hide-interface');
      }, 3000);
    }
  }

  container.addEventListener('mousemove', startControlsTimeout);
  container.addEventListener('touchstart', startControlsTimeout);

  // Keyboard Shortcuts hotkeys
  window.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('active')) {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      
      switch (e.code) {
        case 'Space':
          togglePlay();
          break;
        case 'KeyM':
          muteBtn.click();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          video.currentTime = Math.max(0, video.currentTime - 5);
          showStateIcon('◀◀');
          break;
        case 'ArrowRight':
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
          showStateIcon('▶▶');
          break;
        case 'ArrowUp':
          setVolume(Math.min(1, video.volume + 0.1));
          break;
        case 'ArrowDown':
          setVolume(Math.max(0, video.volume - 0.1));
          break;
      }
    }
  });

  // Double tap gestures (left/right) on video overlay
  wrapper.addEventListener('click', (e) => {
    // Only register taps on the wrapper background, not controls/modals
    if (e.target !== wrapper && e.target !== video) return;
    
    tapCount++;
    if (tapCount === 1) {
      doubleTapTimeout = setTimeout(() => {
        tapCount = 0;
        togglePlay();
      }, 300);
    } else if (tapCount === 2) {
      clearTimeout(doubleTapTimeout);
      tapCount = 0;
      
      // Calculate click location percentage (x-axis)
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      if (x < rect.width / 2) {
        // Double tap on left half -> rewind 10s
        video.currentTime = Math.max(0, video.currentTime - 10);
        doubleTapLeft.classList.remove('trigger');
        void doubleTapLeft.offsetWidth; // Trigger reflow
        doubleTapLeft.classList.add('trigger');
      } else {
        // Double tap on right half -> fast-forward 10s
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        doubleTapRight.classList.remove('trigger');
        void doubleTapRight.offsetWidth; // Trigger reflow
        doubleTapRight.classList.add('trigger');
      }
    }
  });

  // Resume Alert modal actions
  resumeAcceptBtn.addEventListener('click', () => {
    video.currentTime = resumeTimestamp;
    resumeAlert.classList.remove('active');
    video.play();
  });

  resumeRestartBtn.addEventListener('click', () => {
    resumeAlert.classList.remove('active');
    video.play();
  });

  // Save Viewing Progress throttled
  function saveProgress() {
    if (video.duration && activeVideoPath) {
      // If close to the end, clear the saved time
      if (video.currentTime > video.duration - 10) {
        localStorage.removeItem(`aios_video_resume_${activeVideoPath}`);
      } else {
        localStorage.setItem(`aios_video_resume_${activeVideoPath}`, video.currentTime);
      }
    }
  }

  // Obfuscated mapping for Cloudinary CDN video streams
  const base64Links = {
    "SaaS_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMjg0L1NhYVNfaGluZGlfejhnOGtlLm1wNA==",
    "Inbound_Voice_AI_Studio_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMjkxL0luYm91bmRfVm9pY2VfQUlfU3R1ZGlvX2hpbmRpX3o1bG1ydC5tcDQ=",
    "SaaS_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMjk0L1NhYVNfZW5nX2l2eXV3aC5tcDQ=",
    "Drop-Servicing_Sprint_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMjk3L0Ryb3AtU2VydmljaW5nX1NwcmludF9lbmdfdjI0NTNnLm1wNA==",
    "Managed_Creator_Network_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzAwL01hbmFnZWRfQ3JlYXRvcl9OZXR3b3JrX2VuZ193bW5iOW0ubXA0",
    "Managed_Creator_Network_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzA3L01hbmFnZWRfQ3JlYXRvcl9OZXR3b3JrX2hpbmRpX2ZkY3B3MC5tcDQ=",
    "Motion_Script_Compiler_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzIzL01vdGlvbl9TY3JpcHRfQ29tcGlsZXJfZW5nX3l4Z2FvNS5tcDQ=",
    "Content_Engine_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzI0L0NvbnRlbnRfRW5naW5lX2VuZ190eXVyY3oubXA0",
    "Drop-Servicing_Sprint_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzI1L0Ryb3AtU2VydmljaW5nX1NwcmludF9oaW5kaV95ZHZ2ZXkubXA0",
    "Inbound_Voice_AI_Studio_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzMxL0luYm91bmRfVm9pY2VfQUlfU3R1ZGlvX2VuZ190YWJkemMubXA0",
    "AI_Nursery_Rhyme_Engine_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzM5L0FJX051cnNlcnlfUmh5bWVfRW5naW5lX2hpbmRpX3BkZ3JpYS5tcDQ=",
    "Content_Engine_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzQyL0NvbnRlbnRfRW5naW5lX2hpbmRpX2phdHp1Zy5tcDQ=",
    "Motion_Script_Compiler_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzQ0L01vdGlvbl9TY3JpcHRfQ29tcGlsZXJfaGluZGlfdTBrbmZtLm1wND",
    "AAA_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzQ3L0FBQV9lbmdfdmVocm96Lm1wND",
    "AAA_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzUxL0FBQV9oaW5kaV9la3VxZDYubXA0",
    "AI_Nursery_Rhyme_Engine_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzUxL0FJX051cnNlcnlfUmh5bWVfRW5naW5lX2VuZ19vZmE2aHEubXA0",
    "AI_Video_Ad_Pipeline_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzUzL0FJX1ZpZGVvX0FkX1BpcGVsaW5lX2VuZ19iZGJyMXUubXA0",
    "AI_Video_Ad_Pipeline_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyMzU0L0FJX1ZpZGVvX0FkX1BpcGVsaW5lX2hpbmRpX2MwZ3oyNi5tcDQ=",
    "part5_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNDc2L3BhcnQ1X2hpbmRpX2h0cXp0Yi5tcDQ=",
    "part3_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNDg0L3BhcnQzX2hpbmRpX3VuZGJidy5tcDQ=",
    "part1_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNDg4L3BhcnQxX2hpbmRpX2RoZXp6bi5tcDQ=",
    "part5_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNDk0L3BhcnQ1X2VuZ19qOG43YXIubXA0",
    "part4_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTAyL3BhcnQ0X2hpbmRpX28xc3FmOC5tcDQ=",
    "part1_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTA1L3BhcnQxX2VuZ19obHJ0Z2cubXA0",
    "part3_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTA5L3BhcnQzX2VuZ19hbWVhcGgubXA0",
    "part2_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTEyL3BhcnQyX2VuZ19lbzg0ZTgubXA0",
    "part2_hindi.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTIwL3BhcnQyX2hpbmRpX3JyeW91by5tcDQ=",
    "part4_eng.mp4": "aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20veDZ2ZDNndnYvdmlkZW8vdXBsb2FkL3YxNzgyOTEyNTIxL3BhcnQ0X2VuZ19lajVxeWEubXA0"
  };

  function extractFilename(path) {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  // Exposed Global Player Trigger
  window.playPremiumVideo = function(videoPath, title) {
    const filename = extractFilename(videoPath);
    let resolvedUrl = videoPath;
    if (base64Links[filename]) {
      try {
        resolvedUrl = atob(base64Links[filename]);
      } catch (e) {
        console.error("Failed to decode video url:", e);
      }
    }
    
    activeVideoPath = filename || videoPath;
    video.src = resolvedUrl;
    document.getElementById('premium-player-title').textContent = title || "AI-OS Lecture";
    
    // Show Modal
    overlay.style.display = 'flex';
    void overlay.offsetWidth; // force redraw
    overlay.classList.add('active');
    
    // Start progress saver loop
    clearInterval(saveInterval);
    saveInterval = setInterval(saveProgress, 3000);
  };

  // Bind close buttons
  closeBtn.addEventListener('click', closePlayer);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePlayer();
    }
  });

})();
