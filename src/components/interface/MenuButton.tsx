import { playClick, playHover } from '../../lib/audio';
import { Button } from '../ui/Button';

// toggles the mobile nav when the screen is too narrow for the full bar
export function MenuButton({ label, onClick, className, disabled }: { label: string; onClick: () => void; className?: string; disabled?: boolean }) {
  return (
    <Button
      className={className}
      disabled={disabled}
      onMouseEnter={disabled ? undefined : playHover}
      onClick={() => {
        if (disabled) return;
        playClick();
        onClick();
      }}
    >
      {label}
    </Button>
  );
}       