import { playClick, playHover } from '../../lib/audio';
import { Button } from '../ui/Button';

// toggles the mobile nav when the screen is too narrow for the full bar
export function MenuButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <Button
      className={className}
      onMouseEnter={playHover}
      onClick={() => {
        playClick();
        onClick();
      }}
    >
      {label}
    </Button>
  );
}       