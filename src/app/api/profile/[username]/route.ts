import { searchProfileByUsername, testPublicProfiles } from "@/features/profile/testData";

// test this by visiting npm run dev, and going to http://localhost:3000/api/profile/(username)
// GET handler for search  
export async function GET (
    request: Request,
    { params }: { params: Promise<{ username: string }>}
) {
    const { username } = await params;
    const profile = searchProfileByUsername(username);
    // if the profile does not exist, return 404
    if (!profile) { 
        return Response.json(
            {error: "Unable to find profile."},
            {status: 404}
        );
    }
    // profile successfully found
    return Response.json(profile);
}
