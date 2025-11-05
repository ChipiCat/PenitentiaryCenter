import React from "react";
import { Avatar } from "@mantine/core";

export interface UserAvatarProps {
  name: string;
  role?: string;
  photoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role,
  photoUrl,
  size = "md",
}) => {
  const getUserInitials = (userName: string) => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
  };

  const getUserColor = (userRole?: string) => {
    if (!userRole) return "gray";
    if (userRole.includes("director")) return "blue";
    if (userRole.includes("secretario")) return "green";
    if (userRole.includes("admin")) return "red";
    if (userRole.includes("guard")) return "orange";
    return "gray";
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Avatar size={size} color={getUserColor(role)} src={photoUrl}>
        {getUserInitials(name)}
      </Avatar>
    </div>
  );
};
