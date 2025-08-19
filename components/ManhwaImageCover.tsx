import { StyleSheet, useWindowDimensions } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { getRelativeHeight } from '@/helpers/util'
import { Image } from 'expo-image'


interface ManhwaImageCoverProps {
  url: string
}


const ManhwaImageCover = ({ url }: ManhwaImageCoverProps) => {  

  const { width, height } = useWindowDimensions();
  const w = width * 0.92
  const h = getRelativeHeight(720, 980, w)

  return (
    <Image 
      source={url} 
      contentFit='cover' 
      style={{...styles.image, width: w, height: h}}
      transition={AppConstants.DEFAULT_IMAGE_TRANSITION} />
  )
}

export default ManhwaImageCover

const styles = StyleSheet.create({
  image: {
    borderRadius: AppConstants.BORDER_RADIUS * 2
  }
})