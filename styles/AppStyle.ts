import { Colors } from "@/constants/Colors";
import { hp, wp } from "@/helpers/util";
import { StyleSheet } from "react-native";


export const AppStyle = StyleSheet.create({
    textRegular: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'LeagueSpartan_400Regular'
    },
    textHeader: {
        fontSize: 26,
        color: 'white',
        fontFamily: 'LeagueSpartan_400Regular'
    },
    textMangaTitle: {
        fontSize: 28,
        color: 'white',
        fontFamily: 'LeagueSpartan_600SemiBold'
    },
    textLink: {
        fontSize: 16,
        color: Colors.white,
        textDecorationLine: "underline",
        fontFamily: 'LeagueSpartan_400Regular'
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
        fontSize: 22,
        fontFamily: "LeagueSpartan_400Regular",
    },
    buttonBackground: {
        padding: 6, 
        borderRadius: 4, 
        backgroundColor: Colors.almostBlack  
    },
    input: {
        backgroundColor: Colors.gray1,
        borderRadius: 4,
        height: 50,
        fontSize: 18,
        paddingHorizontal: 10,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
    },
    inputHeaderText: {
        color: Colors.white,
        fontSize: 20,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
    },
    error: {
        color: Colors.neonRed,
        alignSelf: "flex-start",
        fontSize: 16,
        fontFamily: "LeagueSpartan_200ExtraLight"
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