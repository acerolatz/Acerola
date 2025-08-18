import { useWindowDimensions } from "react-native";


/**
 * React hook providing responsive dimension utilities.
 * 
 * Calculates width/height percentages relative to current screen dimensions.
 * 
 * @returns Object containing:
 *   - wp: Function to calculate width percentage
 *   - hp: Function to calculate height percentage
 *   - width: Current screen width
 *   - height: Current screen height
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  function wp(percent: number): number {
    return (width * percent) / 100;
  }

  function hp(percent: number): number {
    return (height * percent) / 100;
  }

  return { wp, hp, width, height };
}