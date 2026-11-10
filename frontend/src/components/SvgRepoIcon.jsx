import React from "react";

// SVG Repo hosted icons. These URLs are kept external as requested.
const SVG_REPO_ICONS = {
  users: "https://www.svgrepo.com/show/384126/users-male-people.svg",
  profile: "https://www.svgrepo.com/show/384133/avatar-user-profile-male.svg",
  "add-user": "https://www.svgrepo.com/show/384134/add-user.svg",
  settings: "https://www.svgrepo.com/show/384158/user-config-configuration.svg",
};

export default function SvgRepoIcon({ name = "profile", size = 20, className = "", alt = "" }) {
  const src = SVG_REPO_ICONS[name] || SVG_REPO_ICONS.users;
  return <img src={src} alt={alt} aria-hidden={alt ? undefined : true} width={size} height={size}
    loading="lazy" referrerPolicy="no-referrer" className={`inline-block shrink-0 object-contain ${className}`}
    onError={(event) => { event.currentTarget.style.opacity = "0.25"; }} />;
}
