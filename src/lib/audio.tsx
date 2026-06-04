function isMuted(): boolean {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('audio-muted') === 'true';
  }
  return false;
}

export const playClick = () => {
  if (isMuted()) return;
  const audio = new Audio('/sounds/button_click.wav');
  audio.play().catch(() => {});
};

export const playHover = () => {
  if (isMuted()) return;
  const audio = new Audio('/sounds/button_hover.wav');
  audio.volume = 0.2;
  audio.play().catch(() => {});
};
