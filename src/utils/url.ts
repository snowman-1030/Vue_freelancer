/**
 * URL handling utilities for media files and avatars
 */

/**
 * Convert relative URL to absolute URL if needed
 * @param url The URL to process
 * @returns Processed URL with proper media prefix
 */
export const getFullAvatarUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  
  // Clean up the URL by removing any leading slashes
  const cleanUrl = url.replace(/^\/+/, '')
  
  // If it's already a media URL, just append it to the API URL
  if (cleanUrl.startsWith('media/')) {
    return `${import.meta.env.VITE_API_URL}/${cleanUrl}`
  }
  
  // If it's just an avatar path, add the media prefix
  if (cleanUrl.startsWith('avatars/')) {
    return `${import.meta.env.VITE_API_URL}/media/${cleanUrl}`
  }
  
  // For any other URL, assume it needs the media prefix
  return `${import.meta.env.VITE_API_URL}/media/${cleanUrl}`
}