// test profile data
import type { PublicProfile, UserProfile, ProfileSettings } from "./types";

export const testPublicProfiles: PublicProfile[] = [
    {
        id: "test1",
        username: "goober1",
        level: 10,
        bio: "Here for fun and games!"
    },
    {
        id: "test2",
        username: "goober2",
        avatarUrl: "/goobertest.png",
        level: 29,
        bio: "Here for DEATH and DESTRUCTION!!"
    }
];

export const testUserProfiles: UserProfile[] = [
    {
        id: "test1",
        username: "goober1",
        stats: {
            level: 1,
            xp: 95,
            gamesCompleted: 10,
            recentWins: [
                {
                    gameId: 1,
                    gameLevel: 1,
                    topic: "Algebra",
                    description: "Algebra is Cool n Stuff",
                    button: null
                },
                {
                    gameId: 2,
                    gameLevel: 2,
                    topic: "Algebra",
                    description: "Algebra is Cool n Stuff",
                    button: null
                }
            ]
        },
        createdAt: "January 1, 2026",
        updatedAt: "January 2, 2026",
        email: "goober1@example.com"
    },
    {
        id: "test2",
        username: "goober2",
        avatarUrl: "/goobertest.png",
        stats: {
            level: 27,
            xp: 2949,
            gamesCompleted: 300,
            recentWins: [
                {
                    gameId: 20,
                    gameLevel: 3,
                    topic: "Euclidian Geometry",
                    description: "Euclid is Cool n Stuff",
                    button: null
                },
                {
                    gameId: 21,
                    gameLevel: 4,
                    topic: "Euclidiann Geometry",
                    description: "Euclid is Cool n Stuff",
                    button: null
                }
            ]
        },
        createdAt: "February 1, 2026",
        updatedAt: "February 2, 2026",
        email: "goober2@example.com"
    }
]

// keep this constant across all test users for now
export const testProfileSettings: ProfileSettings = {
    theme: "light"
}

// function to test whether we can search public profiles by username
// either returns a PublicProfile object or undefined
export function searchProfileByUsername(username: string): PublicProfile | undefined {
    return testPublicProfiles.find((profile) => profile.username == username);
}