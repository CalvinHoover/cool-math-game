// how the user's own profile page will look
export interface UserProfile {
    id: string;
    username: string;
    avatarUrl?: string;
    stats: ProfileStats;
    createdAt: string;
    updatedAt: string;
  }

// how the user will see other profile pages
export interface PublicProfile {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
    // irrelevant: xp, createdAt, updatedAt
}

// editable profile data!
export interface UpdateProfileInput {
    username?: string;
    avatarUrl?: string;
}

// game stats area of the profile -- should be uneditable by the user
export interface ProfileStats {
    level: number;
    xp: number;
    gamesCompleted: number;
    recentWins: RecentWin[];
}

// game stats area will contain two of the most recently won games/challenges/exercises
export interface RecentWin {
    gameId: number;
    gameLevel: number;
    topic: string;
    description: string;
    // TODO: add button to either 1) go try the level yourself, or 2) view the finished result
    button: null;
}