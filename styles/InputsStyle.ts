import { StyleSheet } from "react-native";
import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/typography";
import { hp } from "@/helpers/util";


export const InputsStyle = StyleSheet.create({
  input: {
    ...Typography.regular,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    height: AppConstants.UI.BUTTON.SIZE,
    paddingHorizontal: 10,
    color: Colors.white,
  },
  inputMedium: {
    ...Typography.regular,
    backgroundColor: Colors.backgroundSecondary,
    textAlignVertical: 'top',
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    height: hp(12),
    paddingHorizontal: 10,
    color: Colors.white,
  },
  inputLarge: {
    ...Typography.regular,
    backgroundColor: Colors.backgroundSecondary,
    textAlignVertical: 'top',
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    height: hp(20),
    paddingHorizontal: 10,
    color: Colors.white,
  },
});
