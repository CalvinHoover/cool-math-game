'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import '../dashboard/Dashboard.css'; 

export default function Settings() {
  const router = useRouter();

  return (
    <div className="app-container">
      <h1 className="main-title">Settings</h1>
      
      <div className="button-group">
        <MenuButton 
          label="Audio" 
          onClick={() => console.log('Audio button clicked')} 
          className="btn-practice" 
        />
        <MenuButton 
          label="Difficulty" 
          onClick={() => console.log('Difficulty button clicked')} 
          className="btn-multiplayer" 
        />
        <MenuButton 
          label="Back to Menu" 
          onClick={() => router.push('/dashboard')} 
          className="btn-settings" 
        />
      </div>
    </div>
  );
}