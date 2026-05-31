"use client";

import { useState } from "react";
import { UserProfile } from "../types"
import { testUserProfiles } from "../testData"

type EditProfileProps = {
    profile: UserProfile;
    onSave: (updatedProfile: UserProfile) => void;
};

export default function EditProfile({
    profile, onSave,
}: EditProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editedUsername, setEditedUsername] = useState(profile.username);
    const [editedBio, setEditedBio] = useState(profile.bio);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="profile-button"
            > Edit Profile
            </button>

            {isOpen && (
                <div className="mt-4 border p-6">
                    <h2 className="mb-4 text-xl font-bold"> Edit Profile </h2>
                    <div className="space-y-4">
                        <div>
                            <label>Username</label>

                            <input
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                                className="w-full border p-2" />
                        </div>

                        <div> 
                            <label>Bio</label>
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                className="w-full border p-2" />
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => {
                            onSave({
                                ...profile,
                                username: editedUsername,
                                bio: editedBio,
                            });

                            setIsOpen(false);
                        }}
                        className="profile-button"> Save </button>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="profile-button"> Cancel </button>
                    </div>
                </div>
            )}
        </>
    )
}