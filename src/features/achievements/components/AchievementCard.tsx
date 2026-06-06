interface AchievementCardProps {
  name: string;
  description: string;
  color: string;
  earned: boolean;
  earnedAt?: Date;
}

export function AchievementCard({ name, description, color, earned, earnedAt }: AchievementCardProps) {
  return (
    <div style={{
      border: `4px outset #CCCCCC`,
      background: earned ? '#001100' : '#111111',
      padding: '16px 20px',
      width: '220px',
      opacity: earned ? 1 : 0.5,
      fontFamily: 'Courier New, monospace',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: earned ? color : '#444444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        fontSize: '1.2rem',
      }}>
        {earned ? '🏆' : '✕'}
      </div>

      <p style={{ color: earned ? '#00FF00' : '#888888', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
        {name}
      </p>
      <p style={{ color: '#AAAAAA', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '8px' }}>
        {description}
      </p>

      <span style={{
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: earned ? '#00FF00' : '#666666',
        textTransform: 'uppercase',
      }}>
        {earned ? 'Unlocked' : 'Locked'}
      </span>

      {earned && earnedAt && (
        <p style={{ color: '#666666', fontSize: '0.7rem', marginTop: '4px' }}>
          {earnedAt.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
