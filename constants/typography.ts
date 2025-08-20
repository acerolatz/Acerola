import { hp } from "@/helpers/util";
import { StyleSheet } from "react-native";
import { Colors } from "./Colors";


/**
 * Standardized font size constants for the app.
 *
 * Uses `hp` helper function to scale font sizes relative to screen height,
 * ensuring consistent appearance across devices.
 *
 * @remarks
 * - `pp`: Extra small/paragraph font
 * - `xs`: Extra small
 * - `sm`: Small
 * - `md`: Medium (default body)
 * - `lg`: Large (titles/headings)
 * - `xl`: Extra large (major headings)
 *
 * @example
 * import { FontSizes } from "@/constants/FontSizes";
 *
 * const styles = StyleSheet.create({
 *   title: { fontSize: FontSizes.xl, fontWeight: "bold" },
 *   body: { fontSize: FontSizes.md },
 * });
 */
export const FontSizes = {
  pp: hp(1.4),
  xs: hp(1.8),
  sm: hp(2.2),
  md: hp(2.4),
  lg: hp(2.7),
  xl: hp(3),
};


/**
 * Standardized typography styles for the app.
 *
 * Provides reusable `StyleSheet` objects for various font weights and sizes.
 * Uses the `LeagueSpartan` font family with scaling from `FontSizes` and
 * default color from `Colors.white`.
 *
 * @remarks
 * - `light`, `regular`, `semibold`: Base weights with default sizes.
 * - Variants like `lightSm`, `regularMd`, `semiboldXl` provide weight + specific size combinations.
 * - Designed for consistent text styling across the app.
 *
 */
export const Typography = StyleSheet.create({
  light: {
    fontFamily: "LeagueSpartan_200ExtraLight",
    fontWeight: "200",
    fontSize: FontSizes.xs,
    color: Colors.white
  },
  lightUnderline: {
    fontFamily: "LeagueSpartan_200ExtraLight",
    fontWeight: "200",
    fontSize: FontSizes.xs,
    color: Colors.white,
    textDecorationLine: "underline"
  },
  regular: {
    fontFamily: "LeagueSpartan_400Regular",
    fontWeight: "400",
    fontSize: FontSizes.sm,
    color: Colors.white
  },
  semibold: {
    fontFamily: "LeagueSpartan_600SemiBold",
    fontWeight: "600",
    fontSize: FontSizes.lg,
    color: Colors.white
  },  
  lightSm: {
    fontFamily: "LeagueSpartan_200ExtraLight",
    color: Colors.white,
    fontSize: FontSizes.sm,
  },
  lightMd: {
    fontFamily: "LeagueSpartan_200ExtraLight",
    color: Colors.white,
    fontSize: FontSizes.md,
  },
  regularMd: {
    fontFamily: "LeagueSpartan_400Regular",
    color: Colors.white,
    fontSize: FontSizes.md,
  },
  regularLg: {
    fontFamily: "LeagueSpartan_400Regular",
    color: Colors.white,
    fontSize: FontSizes.lg,
  },
  semiboldLg: {
    fontFamily: "LeagueSpartan_600SemiBold",
    color: Colors.white,
    fontSize: FontSizes.lg,
  },
  semiboldXl: {
    fontFamily: "LeagueSpartan_600SemiBold",
    color: Colors.white,
    fontSize: FontSizes.xl,
  },
});