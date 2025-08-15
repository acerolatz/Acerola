import { StyleSheet } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { hp } from '@/helpers/util'
import { Image } from 'expo-image'


const ManhwaImageCover = ({url}: {url: string}) => {

  return (
    <Image 
      source={url} 
      contentFit='cover' 
      style={styles.image}
      transition={AppConstants.COMMON.IMAGE_TRANSITION} />
  )
}

export default ManhwaImageCover

const styles = StyleSheet.create({
  image: {    
    width: 720,
    height: 980,
    maxWidth: AppConstants.COMMON.SCREEN_WIDTH - AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL * 2,
    maxHeight: hp(70),
    borderRadius: AppConstants.COMMON.BORDER_RADIUS
  }
})