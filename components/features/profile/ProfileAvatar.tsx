"use client";

import { useState } from "react";

export default function ProfileAvatar({ image, size }: ProfileAvatarProps) {
  const avatarSize = size ?? 96;
  const [avatarSrc, setAvatarSrc] = useState(image ?? "/default.jpeg");


return (
  <div>
    {/* Avatar */}
    <img
        src={avatarSrc}
        alt="Profile avatar"
        style={{ width: avatarSize, height: avatarSize }}
        className="rounded-full border"
    />


    {/* Action */}
    <button type="button">
      Change avatar
    </button>
  </div>
);

}

