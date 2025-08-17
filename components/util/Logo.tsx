import React from 'react'
import { StyleSheet } from 'react-native'
import { AppConstants } from '../../constants/AppConstants'
import { Image } from 'expo-image'


const AppLogo = () => {
  return (
    <Image 
      source={require("@/assets/images/kisshot.png")} 
      style={styles.image} 
      contentFit='fill'
      transition={1000} />
  )
}


export default AppLogo


const styles = StyleSheet.create({
  image: {
    width: AppConstants.ICON.SIZE * 2,
    height: AppConstants.ICON.SIZE * 2,
    borderRadius: AppConstants.BUTTON.SIZE
  }
})