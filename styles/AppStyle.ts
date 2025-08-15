import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/typography";
import { hp } from "@/helpers/util";
import { StyleSheet } from "react-native";


export const AppStyle = StyleSheet.create({
    textRegular: {
        fontSize: AppConstants.TEXT.SIZE.REGULAR,
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontFamily: AppConstants.TEXT.FONT.REGULAR
    },
    textHeader: {
        fontSize: AppConstants.TEXT.SIZE.SEMIBOLD,
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontFamily: AppConstants.TEXT.FONT.REGULAR
    },
    textMangaTitle: {
        fontSize: AppConstants.TEXT.SIZE.BOLD,
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontFamily: AppConstants.TEXT.FONT.SEMIBOLD
    },
    textLink: {
        fontSize: AppConstants.TEXT.SIZE.LIGTH,
        color: AppConstants.TEXT.COLOR.LIGHT,
        textDecorationLine: "underline",
        fontFamily: AppConstants.TEXT.FONT.REGULAR
    },
    safeArea: {
        width: '100%', 
        flex: 1, 
        paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL,
        paddingTop: AppConstants.COMMON.SCREEN_PADDING_VERTICAL,
        backgroundColor: Colors.backgroundColor
    },
    formButtonText: {
        color: Colors.backgroundColor,
        fontSize: AppConstants.TEXT.SIZE.SEMIBOLD,
        fontFamily:AppConstants.TEXT.FONT.REGULAR,
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
    inputHeaderText: {
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontSize: 18,
        fontFamily: AppConstants.TEXT.FONT.REGULAR
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
    center: {
        alignItems: "center",
        justifyContent: "center"
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
    defaultGridItemText: {
        ...Typography.regular,
        color: Colors.backgroundColor
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