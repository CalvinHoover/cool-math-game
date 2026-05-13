export const playClick = () => {
    const audio = new Audio('/sounds/button_click.wav');
    audio.play();
};

export const playHover = () => {
    const audio = new Audio('/sounds/button_hover.wav');
    audio.volume = 0.2; 
    audio.play();
};
