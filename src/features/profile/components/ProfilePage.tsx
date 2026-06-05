import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import MatchHistoryList from "./MatchHistory";
import { UserProfile, UserSettings } from "../types";
import SettingsPanel from "./SettingsPanel";
import FontSizeSelector from "./FontSizeSelector";

type ProfilePageProps = {
    profile: UserProfile;
  };
  
  export default function ProfilePage({
    profile,
  }: ProfilePageProps) {
    return (
      <main className="space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={true} />
  
        <ProfileStats stats={profile.stats} />
  
        {profile.settings.showMatchHistory && (
          <MatchHistoryList matches={profile.matchHistory} />
        )}
  
        <SettingsPanel settings={profile.settings} onChange={function (updatedSettings: UserSettings): void {
                throw new Error("Function not implemented.");
            } } />
  
        <FontSizeSelector
                fontSize={profile.settings.fontSize} onChange={function (fontSize: "small" | "medium" | "large"): void {
                    throw new Error("Function not implemented.");
                } }        />
      </main>
    );
  }