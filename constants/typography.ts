import { hp } from "@/helpers/util";
import { StyleSheet } from "react-native";
import { Colors } from "./Colors";


export const FontSizes = {
  pp: hp(1.4),
  xs: hp(1.8),
  sm: hp(2.2),
  md: hp(2.4),
  lg: hp(2.7),
  xl: hp(3),
};


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