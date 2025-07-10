import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";
import { hp, wp } from "@/helpers/util";
import { StyleSheet } from "react-native";


export const AppStyle = StyleSheet.create({
    textLight: {
        fontSize: AppConstants.TEXT.SIZE.LIGTH,
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontFamily: AppConstants.TEXT.FONT.LIGHT
    },
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
        paddingHorizontal: wp(4),
        paddingTop: hp(4),
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
        backgroundColor: Colors.gray1,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        height: 50,
        paddingHorizontal: 10,
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontSize: AppConstants.TEXT.SIZE.REGULAR,
        fontFamily: AppConstants.TEXT.FONT.REGULAR,
        marginBottom: 10
    },
    inputHeaderText: {
        color: AppConstants.TEXT.COLOR.LIGHT,
        fontSize: 20,
        fontFamily: AppConstants.TEXT.FONT.REGULAR,
        marginBottom: 10
    },
    error: {
        color: AppConstants.TEXT.COLOR.ERROR,
        alignSelf: "flex-start",
        fontSize: AppConstants.TEXT.SIZE.LIGTH,
        fontFamily: AppConstants.TEXT.FONT.LIGHT
    },
    formButton: {
        width: '100%',
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 4,
        backgroundColor: Colors.orange
    },
    center: {
        alignItems: "center",
        justifyContent: "center"
    }
})