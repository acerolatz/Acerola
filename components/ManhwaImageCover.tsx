import { StyleSheet } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { getRelativeHeight } from '@/helpers/util'
import { Image } from 'expo-image'


interface ManhwaImageCoverProps {
  url: string
}


const ManhwaImageCover = ({ url }: ManhwaImageCoverProps) => {  

  const w = AppConstants.UI.SCREEN.WIDTH * 0.92
  const h = getRelativeHeight(720, 980, w)

  return (
    <Image 
      source={url} 
      contentFit='cover' 
      cachePolicy={'disk'}
      style={{...styles.image, width: w, height: h}}
      transition={AppConstants.UI.ANIMATION_TIME} />
  )
}

export default ManhwaImageCover

const styles = StyleSheet.create({
  image: {
    borderRadius: AppConstants.UI.BORDER_RADIUS * 2
  }
})