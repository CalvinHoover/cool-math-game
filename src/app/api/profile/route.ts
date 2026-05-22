import {NextRequest, NextResponse} from "next/server";
import type {UserProfile, UpdateProfileInput} from "@/features/profile/types";

let testProfile: UserProfile = {
    id: "1",
    username: "Test User",
    avatarUrl: undefined,
    stats: {
        level: 1,
        xp: 0,
        gamesCompleted: 0,
        recentWins: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email: "example.com" // had to add this here to run tests on testData.test.ts, not sure why
};

// just using npm run dev to test these for now, but we can consider using Jest for further testing? or Postman?
// to test: visit http://localhost:3000/api/profile
export async function GET() {
    return NextResponse.json(
        {
            profile: testProfile,
        }
    );
}

// to test: curl -X PUT http://localhost:3000/api/profile \
// -H "Content-Type: application/json" \ -d '{"username":"TotallyNotMax","avatarUrl":"https://example.com/avatar.png"}'
export async function PUT(request: NextRequest) {
    const body: UpdateProfileInput = await request.json();

    testProfile = {
        ...testProfile,
        username: body.username ?? testProfile.username,
        avatarUrl: body.avatarUrl ?? testProfile.avatarUrl,
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json (
        {
            success: true,
            profile: testProfile,
        }
    );
}