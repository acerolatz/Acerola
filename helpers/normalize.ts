import { AppConstants } from "@/constants/AppConstants"


export function normalizeRandomManhwaCardHeight(width: number, height: number): {
  normalizedWidth: number, 
  normalizedHeight: number
} {
  const normalizedHeight = height > AppConstants.RANDOM_MANHWAS.MAX_HEIGHT ? 
    AppConstants.RANDOM_MANHWAS.MAX_HEIGHT :
    height
  
  let normalizedWidth = (normalizedHeight * width) / height

  normalizedWidth = normalizedWidth > AppConstants.RANDOM_MANHWAS.MAX_WIDTH ?
    AppConstants.RANDOM_MANHWAS.MAX_WIDTH : 
    normalizedWidth
  return { normalizedWidth, normalizedHeight}
}