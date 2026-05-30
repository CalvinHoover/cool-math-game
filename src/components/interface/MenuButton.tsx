import { playClick, playHover } from '../../lib/audio';

export function MenuButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      className={className}
      onMouseEnter={playHover}
      onClick={() => {
        playClick();
        onClick();
      }}
    >
      {label}
    </button>
  );
}       