// Dynamic Video Player Loader for AI-OS
// Powered by A.R. Labs

export async function playVideoWithPlayer(videoPath, title) {
  if (!window.playPremiumVideo) {
    await import('../video-player.js');
  }
  if (window.playPremiumVideo) {
    window.playPremiumVideo(videoPath, title);
  } else {
    console.error("Failed to load video player component.");
  }
}

// Global exposure for backward compatibility
window.playPremiumVideoWrapper = playVideoWithPlayer;
