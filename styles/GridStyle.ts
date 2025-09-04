import { StyleSheet } from "react-native";
import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";

export const GridStyle = StyleSheet.create({
  defaultGridItem: {
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.primary,
    marginRight: AppConstants.UI.MARGIN,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    gap: AppConstants.UI.GAP,
  },
  dot: {
    height: AppConstants.UI.ICON.SIZE,
    width: AppConstants.UI.ICON.SIZE,
    borderRadius: AppConstants.UI.BORDER_RADIUS * 2,
    backgroundColor: Colors.primary,
  },
});
