import { StyleSheet, useWindowDimensions } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { getRelativeHeight, wp } from '@/helpers/util'
import { Image } from 'expo-image'


const MAX_WIDTH = AppConstants.COMMON.SCREEN_WIDTH - AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL * 2


const ManhwaImageCover = ({url}: {url: string}) => {  

  const { width, height } = useWindowDimensions();
  const w = width * 0.92
  const h = getRelativeHeight(720, 980, w)

  return (
    <Image 
      source={url} 
      contentFit='cover' 
      style={{...styles.image, width: w, height: h}}
      transition={AppConstants.COMMON.IMAGE_TRANSITION} />
  )
}

export default ManhwaImageCover

const styles = StyleSheet.create({
  image: {
    borderRadius: AppConstants.COMMON.BORDER_RADIUS
  }
})