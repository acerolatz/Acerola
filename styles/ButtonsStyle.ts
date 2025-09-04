import { StyleSheet } from "react-native";
import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";


export const ButtonsStyle = StyleSheet.create({
  button: {
    flex: 1,
    height: AppConstants.UI.BUTTON.SIZE,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    flex: 1,
    height: AppConstants.UI.BUTTON.SIZE,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  formButton: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    height: AppConstants.UI.BUTTON.SIZE,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.primary,
  },
});
