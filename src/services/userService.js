const PROFILE_KEY = 'bookshelf_user_profile'

function generateUserId() {
  return 'user-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function getUserIdentifier() {
  const profile = getUserProfile()
  return profile.userId
}

function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.userId) return parsed
    }
  } catch { /* ignore */ }

  const defaultProfile = {
    userId: generateUserId(),
    username: 'Reader',
    bio: '',
    avatar: null,
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile))
  return defaultProfile
}

function saveUserProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    return { success: true, data: profile }
  } catch {
    return { success: false }
  }
}

function updateAvatar(base64) {
  const profile = getUserProfile()
  profile.avatar = base64
  return saveUserProfile(profile)
}

const userService = {
  getUserProfile,
  saveUserProfile,
  updateAvatar,
}

export default userService
