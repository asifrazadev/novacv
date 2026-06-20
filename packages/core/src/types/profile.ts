export interface UserProfile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  phone: string
  location: string
  headline: string
  bio: string
  website: string
  linkedin_url: string
  github_url: string
  twitter_url: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  location?: string
  headline?: string
  bio?: string
  website?: string
  linkedin_url?: string
  github_url?: string
  twitter_url?: string
}

export interface AvatarUploadData {
  file: File
  userId: string
}
