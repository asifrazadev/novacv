// src/constants/defaults.ts

export const DEFAULT_LAYOUT = {
  main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
  sidebar: ["skills", "languages", "interests", "awards", "certifications", "profiles"]
}

export const SINGLE_COLUMN_TEMPLATES = ["jake", "executive", "academic"]

export const DEFAULT_PAGE_PADDING = 20

export interface SocialNetwork {
  name: string
  iconKey: string
  url: string
  base: string
}

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { name: "LinkedIn", iconKey: "linkedin", url: "https://linkedin.com", base: "https://linkedin.com/in/" },
  { name: "GitHub", iconKey: "github", url: "https://github.com", base: "https://github.com/" },
  { name: "Twitter", iconKey: "twitter", url: "https://twitter.com", base: "https://twitter.com/" },
  { name: "Instagram", iconKey: "instagram", url: "https://instagram.com", base: "https://instagram.com/" },
  { name: "YouTube", iconKey: "youtube", url: "https://youtube.com", base: "https://youtube.com/@" },
  { name: "Facebook", iconKey: "facebook", url: "https://facebook.com", base: "https://facebook.com/" },
  { name: "Dribbble", iconKey: "dribbble", url: "https://dribbble.com", base: "https://dribbble.com/" },
  { name: "Behance", iconKey: "behance", url: "https://behance.net", base: "https://behance.net/" },
  { name: "Medium", iconKey: "medium", url: "https://medium.com", base: "https://medium.com/@" },
  { name: "Dev.to", iconKey: "devto", url: "https://dev.to", base: "https://dev.to/" },
  { name: "Twitch", iconKey: "twitch", url: "https://twitch.tv", base: "https://twitch.tv/" },
  { name: "Discord", iconKey: "discord", url: "https://discord.com", base: "https://discord.com/users/" },
  { name: "LeetCode", iconKey: "leetcode", url: "https://leetcode.com", base: "https://leetcode.com/u/" },
  { name: "Stack Overflow", iconKey: "stackoverflow", url: "https://stackoverflow.com", base: "https://stackoverflow.com/users/" },
  { name: "Kaggle", iconKey: "kaggle", url: "https://kaggle.com", base: "https://kaggle.com/" },
]
