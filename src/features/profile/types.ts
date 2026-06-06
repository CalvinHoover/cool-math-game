export interface UserProfile {
    id: string;
    username: string;
    avatarUrl?: string;
    stats: ProfileStats;
    createdAt: string;
    updatedAt: string;
    level: number;
    bio?: string;
    email: string;
    settings: UserSettings;
    matchHistory: PastMatch[];
}

export interface PublicProfile {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
    bio?: string;
}

export interface UpdateProfileInput {
    username?: string;
    avatarUrl?: string;
}

export interface ProfileStats {
    level: number;
    xp: number;
    gamesCompleted: number;
    recentWins: RecentWin[];
}

export interface RecentWin {
    gameId: number;
    gameLevel: number;
    topic: string;
    description: string;
    button: null;
}

export interface UserSettings {
    emailNotifications: boolean;
    publicProfile: boolean;
    showMatchHistory: boolean;
    fontSize: "small" | "medium" | "large";
}

export interface PastMatch {
    id: number;
    level: number;
    topic: string;
    opponent: string;
    result: "Won" | "Lost";
    completedOn: string;
}
