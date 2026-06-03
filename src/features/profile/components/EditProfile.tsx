"use client";

import { useState } from "react";
import { UserProfile } from "../types";

type EditProfileProps = {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
};

export default function EditProfile({ profile, onSave, onCancel }: EditProfileProps) {
  // const [isOpen, setIsOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState(profile.username);
  const [editedBio, setEditedBio] = useState(profile.bio);

  return (
    <>
      {/* <button onClick={() => setIsOpen(true)} className="profile-button">
        Edit Profile
      </button> */}

      {(<section className="profile-section">
          <h2>Edit Profile</h2>

          <div className="profile-form">
            <div>
              <label className="profile-label">Username</label>

              <input
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="profile-input"
              />
            </div>

            <div>
              <label className="profile-label">Bio</label>

              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>

          <div className="profile-button-row">
            <button
              onClick={() => {
                onSave({
                  ...profile,
                  username: editedUsername,
                  bio: editedBio,
                });

                //setIsOpen(false);
              }}
              className="profile-button"
            >
              Save
            </button>

            <button
              onClick={onCancel}
              className="profile-button"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </>
  );
}