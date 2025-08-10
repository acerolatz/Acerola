import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { DonateMethod } from '@/helpers/types'
import * as Clipboard from 'expo-clipboard'
import Column from './util/Column'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import Toast from 'react-native-toast-message'

const DonateComponent = ({item}: {item: DonateMethod}) => {  
    const iconName = item.action == "copy" ? "copy-outline" : "globe-outline"

    const openUrl = async (url: string) => {
        try {
            await Linking.openURL(url)
        } catch (error) {
          Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
        }
      };
    
      const copyToClipboard = async (value: string) => {
        await Clipboard.setStringAsync(value);
        Toast.show(ToastMessages.EN.COPIED_TO_CLIPBOARD)
    }

    const onPress = async (donate: DonateMethod) => {
        switch (donate.action) {
          case "copy":
            await copyToClipboard(donate.value)
            break
          case "link":
            await openUrl(donate.value)
            break
          default:
            break
        }
    }

    return (
      <Pressable onPress={() => onPress(item)} style={styles.donateButton} >
        <Column style={styles.donateTitleContainer} >
          <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{item.method}</Text>
          <Ionicons name={iconName as any} size={28} color={Colors.backgroundColor} />
        </Column>
        <Text adjustsFontSizeToFit={true} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.value}</Text>
      </Pressable>
    )
}

export default DonateComponent

const styles = StyleSheet.create({
    donateButton: {
        maxWidth: '100%', 
        padding: 10, 
        borderRadius: 4, 
        backgroundColor: Colors.donateColor, 
        marginBottom: 10,
        gap: 10
    },
    donateTitleContainer: {
        width: "100%", 
        flexDirection: 'row', 
        alignItems: "center", 
        gap: 10, 
        justifyContent: "space-between"
    }
})