'use client';

import type { ActivityItem } from '@/features/dashboard/actions';

interface RecentActivityProps {
  items: ActivityItem[];
}

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div style={{
      border: '4px outset #CCCCCC',
      background: '#111111',
      padding: '16px 20px',
      width: '100%',
      fontFamily: 'Courier New, monospace',
    }}>
      <p style={{ color: '#00FFFF', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
        Recent Activity
      </p>
      {items.length === 0 ? (
        <p style={{ color: '#888888', fontSize: '0.85rem' }}>
          No activity yet. Start a practice session!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <li key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #333333',
              paddingBottom: '6px',
            }}>
              <div>
                <p style={{ color: '#FFFFFF', fontSize: '0.9rem', margin: 0 }}>{item.topic}</p>
                <p style={{ color: '#666666', fontSize: '0.75rem', margin: 0 }}>
                  {new Date(item.completedAt).toLocaleDateString()}
                </p>
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                padding: '2px 8px',
                border: '2px outset #CCCCCC',
                color: item.scorePercent >= 80 ? '#00FF00' : item.scorePercent >= 50 ? '#FFFF00' : '#FF4444',
              }}>
                {item.scorePercent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
