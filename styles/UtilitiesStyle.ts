import { StyleSheet } from "react-native";
import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";


export const UtilitiesStyle = StyleSheet.create({
  safeArea: {
    width: '100%',
    flex: 1,
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL,
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    backgroundColor: Colors.backgroundColor
  },
  flex: { flex: 1 },
  gap: { gap: AppConstants.UI.GAP },
  margin: { gap: AppConstants.UI.MARGIN },
  iconCenter: {
    position: 'absolute',
    height: '100%',
    right: AppConstants.UI.ICON.SIZE / 2,
    top: "50%",
    transform: [{ translateY: -AppConstants.UI.ICON.SIZE / 2 }],
  },
});
