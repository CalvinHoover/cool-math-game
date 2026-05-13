// react hook for api.ts functions and profile state
// figure out how to test later once we have components to test them in lol

// need this for client side functions
"use client";

import {useEffect, useState} from "react";
import type {UpdateProfileInput, UserProfile} from "./types";
import {getProfile, updateProfile} from "./api";

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // manually refetch profile
    async function loadProfile() {
        try {
            setLoading(true);
            setError(null);

            const fetchedProfile = await getProfile();
                setProfile(fetchedProfile);
        }
        catch {
            setError("Failed to load profile :[");
        }
        finally {
            setLoading(false);
        }
    }

    // update profile (username, avatar) + refresh local state
    async function saveProfile(input: UpdateProfileInput) {
        try {
            setError(null);

            const updatedProfile = await updateProfile(input);
            setProfile(updatedProfile);

            return updatedProfile;
        }
        catch {
            setError("Failed to update profile :[");
            return null;
        }
    }

    useEffect(() => {
        loadProfile();
    }, []);

    return {
        profile, loading, error, loadProfile, saveProfile,
    };
}
