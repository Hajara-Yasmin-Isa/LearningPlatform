"use client";

import { useState } from "react";

export interface ProfileAvatarProps {
    image?: string;
    size?: number;
}


export default function ProfileAvatar({ image, size }: ProfileAvatarProps) {
    const avatarSize = size ?? 96;
    const [avatarSrc, setAvatarSrc] = useState(image ?? "/default.jpeg");

    const changeAvatar = () => {
        console.log("Avatar change requested (UI-only)");
        // In the future, we could call setAvatarSrc(...) here
    };


    return (
        <div className="flex flex-col items-center gap-2">
            {/* Avatar image */}
            <img
                src={avatarSrc}
                alt="Profile avatar"
                style={{ width: avatarSize, height: avatarSize }}
                className="rounded-full border"
            />


            {/* Action */}
            <button
                type="button"
                onClick={changeAvatar}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                Change avatar
            </button>
        </div>
    );

}

