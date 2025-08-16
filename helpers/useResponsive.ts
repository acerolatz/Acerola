import { useWindowDimensions } from "react-native";

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