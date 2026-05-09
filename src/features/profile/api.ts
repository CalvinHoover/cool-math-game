import type {UpdateProfileInput, UserProfile} from "./types";

// "Promise" represents the completion of an asynch operation, probably like assert()! 
// easiest to test GET: 
// fetch("/api/profile")
//   .then((res) => res.json())
//   .then(console.log);

export async function getProfile(): Promise<UserProfile> {
    const response = await fetch("/api/profile", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch profile :[");
    }

    // return the profile that corresponds to the input given
    const data = await response.json();
    return data.profile;
}

// easiest to test PUT: run in devtools console:
// fetch("/api/profile", {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       username: "TotallyNotMax",
//       avatarUrl: "https://example.com/avatar.png",
//     }),
//   })
//     .then((res) => res.json())
//     .then(console.log);

export async function updateProfile (
    input: UpdateProfileInput
): Promise<UserProfile> {
    const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error("Failed to update profile :[");
    }

    const data = await response.json();
    return data.profile;
}