import { http } from './http'

export interface UserProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  gender: number | null
  avatarUrl: string | null
}

export interface UpdateProfilePayload {
  email: string
  name: string
  surname: string
  phone: string
  gender: number
  avatar?: File | null
}

export function getProfile() {
  return http.get<UserProfile>('/api/UserProfile/index')
}

export function updateProfile(profile: UpdateProfilePayload) {
  const form = new FormData()
  form.append('Email', profile.email)
  form.append('Name', profile.name)
  form.append('Surname', profile.surname)
  if (profile.phone.trim()) form.append('Phone', profile.phone)
  form.append('Gender', String(profile.gender))
  if (profile.avatar) form.append('Avatar', profile.avatar)

  return http.post<UserProfile>('/api/UserProfile/update', form)
}

export function removeAvatar() {
  return http.delete<UserProfile>('/api/UserProfile/remove-avatar')
}
