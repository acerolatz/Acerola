import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/typography";


export const TypographyStyle = StyleSheet.create({
  error: {
    ...Typography.light,
    color: Colors.primary,
    alignSelf: "flex-start",
  },
  textOptional: {
    ...Typography.light,
    color: Colors.primary,
  },
});
