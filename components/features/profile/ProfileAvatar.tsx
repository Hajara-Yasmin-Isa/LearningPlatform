"use client";

import { useState } from "react";

export default function ProfileAvatar({ image, size }: ProfileAvatarProps) {
  const avatarSize = size ?? 96;
  const [avatarSrc, setAvatarSrc] = useState(image ?? "/default.jpeg");
}

return {
    
}

