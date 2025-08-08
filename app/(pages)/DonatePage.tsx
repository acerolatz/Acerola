import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { DonateMethod } from '@/helpers/types'
import { getRelativeHeight, wp } from '@/helpers/util'
import { spGetDonationMethods } from '@/lib/supabase'
import { useDonateState } from '@/store/donateState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  Text
} from 'react-native'
import Toast from 'react-native-toast-message'


const WIDTH = wp(92)
const HEIGHT = getRelativeHeight(986, 1030, WIDTH)


const Donate = () => {  

  const { donates, setDonates } = useDonateState()
  const [loading, setLoading] = useState(false)  
  const donateImage = require("@/assets/images/donate-green.webp")

  useEffect(
    () => {
      let isCancelled = false
      
      const init = async () => {
        if (donates.length != 0) { return }

        setLoading(true)
          const d = await spGetDonationMethods()
          if (isCancelled) { return }
          setDonates(d)
        setLoading(false)
      }
      
      init()

      return () => { isCancelled = true }
    },
    []
  )

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
  
  const renderItem = ({item}: {item: DonateMethod}) => {
    const iconName = item.action == "copy" ? "copy-outline" : "globe-outline"

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

  if (loading) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>
        <PageActivityIndicator color={Colors.donateColor} />
      </SafeAreaView>  
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>
          <FlatList
              data={donates}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Image 
                  source={donateImage} 
                  style={{width: WIDTH, height: HEIGHT, marginBottom: 20, alignSelf: "center"}} 
                  contentFit='cover' />
              }
              renderItem={renderItem}
          />        
    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({
  donateButton: {
    maxWidth: '100%', 
    padding: 10, 
    borderRadius: 4, 
    backgroundColor: Colors.donateColor, 
    marginBottom: 20,
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
