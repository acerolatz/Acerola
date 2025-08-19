import { AppConstants } from "@/constants/AppConstants"


/**
 * Normalizes a manhwa card size so it respects maximum width and height limits.
 *
 * Preserves the original aspect ratio while constraining the card
 * to `AppConstants.RANDOM_MANHWAS.MAX_WIDTH` and
 * `AppConstants.RANDOM_MANHWAS.MAX_HEIGHT`.
 *
 * @param width - Original card width in pixels. Must be > 0.
 * @param height - Original card height in pixels. Must be > 0.
 * @returns An object with the scaled `normalizedWidth` and `normalizedHeight` in pixels.
 *
 */
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