import React from "react"
import { Globe, Terminal } from "lucide-react"

interface SocialIconProps {
  network?: string
  url?: string
  style?: React.CSSProperties
  className?: string
}

const BRAND_COLORS: Record<string, string> = {
  linkedin: "#0a66c2",
  github: "#24292f",
  twitter: "#1da1f2",
  instagram: "#e1306c",
  youtube: "#ff0000",
  facebook: "#1877f2",
  dribbble: "#ea4c89",
  behance: "#0057ff",
  medium: "#000000",
  devto: "#0a0a0a",
  twitch: "#9146ff",
  discord: "#5865f2",
  leetcode: "#ffa116",
  stackoverflow: "#f48024",
  kaggle: "#20beff",
}

// Helper to extract network name from URL
function getNetworkFromUrl(url: string): string {
  if (!url) return "globe"
  try {
    const domain = new URL(url).hostname.toLowerCase()
    if (domain.includes("linkedin.com")) return "linkedin"
    if (domain.includes("github.com")) return "github"
    if (domain.includes("twitter.com") || domain.includes("x.com")) return "twitter"
    if (domain.includes("instagram.com")) return "instagram"
    if (domain.includes("youtube.com") || domain.includes("youtu.be")) return "youtube"
    if (domain.includes("facebook.com")) return "facebook"
    if (domain.includes("dribbble.com")) return "dribbble"
    if (domain.includes("behance.net")) return "behance"
    if (domain.includes("medium.com")) return "medium"
    if (domain.includes("dev.to")) return "devto"
    if (domain.includes("twitch.tv")) return "twitch"
    if (domain.includes("discord.com") || domain.includes("discord.gg")) return "discord"
    if (domain.includes("leetcode.com")) return "leetcode"
    if (domain.includes("stackoverflow.com")) return "stackoverflow"
    if (domain.includes("kaggle.com")) return "kaggle"
  } catch (e) {
    // Fallback if URL is invalid
  }
  return "globe"
}

export function SocialIcon({ network, url, style, className }: SocialIconProps) {
  const net = (network || getNetworkFromUrl(url || "")).toLowerCase()
  const color = BRAND_COLORS[net] || "#6b7280"

  // Render the appropriate icon path/component
  const renderIcon = () => {
    const iconSize = "60%" // Scale relative to container
    switch (net) {
      case "linkedin":
        // LinkedIn custom SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      case "github":
        // GitHub custom SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        )
      case "instagram":
        // Instagram custom SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
        )
      case "facebook":
        // Facebook custom SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      case "devto":
        return <Terminal style={{ width: iconSize, height: iconSize }} className="text-white" />
      case "dribbble":
        // Dribbble custom SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.37c-.363-.122-1.85-.595-3.79-.276.793 2.164 1.114 3.99 1.157 4.254a10.054 10.054 0 0 0 2.633-3.978zm-4.103 5.362c-.062-.367-.42-2.316-1.29-4.59-4.836 1.344-6.526 3.968-6.6 4.09A9.972 9.972 0 0 0 12 22c2.477 0 4.745-.9 6.502-2.396a.152.152 0 0 0-.485-.612zM7.747 18.39c.112-.178 2.015-3.048 6.945-4.237a28.09 28.09 0 0 0-.756-2.583C8.613 13.064 4.5 13.01 4.1 13c.004 2.115.72 4.07 1.912 5.63a13.376 13.376 0 0 0 1.735-.24zM3.86 11.238c.636.008 3.987.054 8.784-1.282a32.964 32.964 0 0 0-2.327-4.48c-4.457 1.545-6.074 4.887-6.14 5.034.187.974.55 1.887.683 4.728zm8.167-7.228a30.825 30.825 0 0 1 2.222 4.28c3.673-1.42 5.143-3.414 5.234-3.543A9.957 9.957 0 0 0 12 4.01zM19.78 6.03c-.113.153-1.8 2.317-5.59 3.593a26.064 26.064 0 0 1 .74 2.455c3.276-.437 6.02.096 6.136.12A10.046 10.046 0 0 0 19.78 6.03z"/>
          </svg>
        )
      case "twitter":
        // Twitter/X inline SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      case "youtube":
        // YouTube inline SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      case "twitch":
        // Twitch inline SVG
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
        )
      case "discord":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 127.14 96.36" fill="white">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2.07a75.79,75.79,0,0,0,72.9,0c.82.73,1.68,1.42,2.58,2.07a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.07,50.12,123.2,27.31,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
          </svg>
        )
      case "behance":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M22 13.855h-6.85c.105.992.83 1.636 1.996 1.636 1.134 0 1.776-.554 1.836-1.424h2.89c-.144 1.956-1.923 3.933-4.726 3.933-3.23 0-4.995-2.096-4.995-5.04 0-2.85 1.765-5.01 4.793-5.01 3.257 0 4.887 2.213 4.856 5.21v.695zm-6.815-2.023h3.978c-.08-.946-.684-1.464-1.785-1.464-1.127 0-1.78.53-2.193 1.464zm-8.86 5.86H2V4.545h4.636c2.81 0 4.148 1.173 4.148 2.87 0 1.258-.87 2.052-1.925 2.378 1.442.26 2.348 1.295 2.348 2.822 0 2.29-1.846 3.078-4.882 3.078zm-2.325-7.464H4.37v2.303H6.32c1.085 0 1.748-.415 1.748-1.168 0-.756-.663-1.135-1.748-1.135zm0 4.126H4.37v2.443H6.32c1.233 0 1.907-.384 1.907-1.233 0-.82-.674-1.21-1.907-1.21zM14 6.643h6v1.393h-6z"/>
          </svg>
        )
      case "medium":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42s-3.38-2.88-3.38-6.42 1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75s-1.19-2.58-1.19-5.75.53-5.75 1.19-5.75S24 8.83 24 12z"/>
          </svg>
        )
      case "leetcode":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.329-4.363c-.466-.467-.662-1.111-.662-1.824s.195-1.357.662-1.824l4.329-4.363c.467-.467 1.112-.662 1.824-.662s1.357.195 1.823.662l2.697 2.607c.467.467.662 1.111.662 1.824s-.195 1.357-.662 1.824l-1.349 1.357-1.357-1.357c-.466-.467-.662-1.111-.662-1.824s.195-1.357.662-1.824l-2.697-2.607c-.466-.467-1.111-.662-1.823-.662s-1.357.195-1.824.662l-4.329 4.363c-.466.467-.662 1.111-.662 1.824s.195 1.357.662 1.824l4.329 4.363c.467.467 1.112.662 1.824.662s1.357-.195 1.823-.662l2.697-2.607c.467-.467.662-1.111.662-1.824s-.195-1.357-.662-1.824l1.357-1.357 1.349 1.357c.466.467.662 1.111.662 1.824s-.195 1.357-.662 1.824zm-6.621-6.621l1.357-1.357 1.357 1.357 1.357-1.357-1.357-1.357-1.357-1.357-1.357 1.357-1.357 1.357 1.357 1.357z"/>
          </svg>
        )
      case "stackoverflow":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M17.297 22.062V14.67h1.85v10.97H5.253V14.67h1.85v7.392h10.194zM16.14 6.848l-8.54 1.78.38 1.83 8.54-1.78-.38-1.83zm-7.39 3.48l-7.7 3.52.82 1.78 7.7-3.52-.82-1.78zm-5.75 5.56l-6.39 5.37 1.2 1.42 6.39-5.37-1.2-1.42zm11.75-8.48l-8.66 1.05.23 1.88 8.66-1.05-.23-1.88z"/>
          </svg>
        )
      case "kaggle":
        return (
          <svg style={{ width: iconSize, height: iconSize }} viewBox="0 0 24 24" fill="white">
            <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v9.096l6.837-7.235c.14-.148.304-.221.492-.221h3.139c.164 0 .259.049.281.141.023.092.016.21-.02.354l-5.26 5.56 5.86 7.458c.074.095.105.187.094.276-.011.088-.047.16-.109.215z"/>
          </svg>
        )
      default:
        return <Globe style={{ width: iconSize, height: iconSize }} className="text-white" />
    }
  }

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: color,
    width: style?.width || 24,
    height: style?.height || 24,
    flexShrink: 0,
    verticalAlign: "middle",
    overflow: "hidden",
  }

  return (
    <span style={{ ...baseStyle, ...style }} className={className}>
      {renderIcon()}
    </span>
  )
}
