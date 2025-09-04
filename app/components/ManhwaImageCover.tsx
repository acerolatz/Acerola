import { AppConstants } from '@/constants/AppConstants'
import { getRelativeHeight } from '@/helpers/util'
import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'


interface ManhwaImageCoverProps {
  url: string
}


const ManhwaImageCover = ({ url }: ManhwaImageCoverProps) => {  
  return (
    <Image 
      source={url} 
      contentFit='cover' 
      cachePolicy={'disk'}
      style={styles.image}
      transition={100} />
  )
}


export default ManhwaImageCover


const styles = StyleSheet.create({
  image: {
    borderRadius: AppConstants.UI.BORDER_RADIUS * 2,
    width: AppConstants.UI.SCREEN.VALID_WIDTH,
    height: getRelativeHeight(720, 980, AppConstants.UI.SCREEN.VALID_WIDTH)
  }
})