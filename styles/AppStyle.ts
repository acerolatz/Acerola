import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/typography";
import { hp } from "@/helpers/util";
import { StyleSheet } from "react-native";


export const AppStyle = StyleSheet.create({
    safeArea: {
        width: '100%', 
        flex: 1, 
        paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL,
        paddingTop: AppConstants.COMMON.SCREEN_PADDING_VERTICAL,
        backgroundColor: Colors.backgroundColor
    },    
    buttonBackground: {
        padding: 6, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
        backgroundColor: Colors.almostBlack  
    },
    input: {
        ...Typography.regular,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        height: AppConstants.BUTTON.SIZE,
        paddingHorizontal: 10,
        color: Colors.white
    },
    inputMedium: {
        ...Typography.regular,
        backgroundColor: Colors.backgroundSecondary,
        textAlignVertical: 'top',
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        height: hp(12),
        paddingHorizontal: 10,
        color: Colors.white
    },
    inputLarge: {
        ...Typography.regular,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        textAlignVertical: 'top',
        height: hp(20),
        paddingHorizontal: 10,
        color: Colors.white
    },    
    error: {
        ...Typography.light,
        color: Colors.primary,
        alignSelf: "flex-start"        
    },
    textOptional: {
        ...Typography.light,
        color: Colors.primary
    },
    formButton: {
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow
    },    
    defaultGridItem: {
        paddingHorizontal: AppConstants.COMMON.ITEM_PADDING_HORIZONTAL,
        paddingVertical: AppConstants.COMMON.ITEM_PADDING_VERTICAL,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow,
        marginRight: AppConstants.COMMON.MARGIN
    },            
    buttonCancel: {
        flex: 1,
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.primary
    },
    button: {
        flex: 1,
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center"
    }
})