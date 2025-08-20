import { AppConstants } from '@/constants/AppConstants'
import { Pressable, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { hp, wp } from '@/helpers/util'
import React from 'react'


interface ChapterArrowUpButtonProps {
    onPress: () => any
}


const ChapterArrowUpButton = ({onPress}: ChapterArrowUpButtonProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.HIT_SLOP.LARGE}
        style={styles.arrowUp}>
        <Ionicons 
          name="arrow-up-outline" 
          size={AppConstants.ICON.SIZE * 0.7} 
          color="rgba(0,0,0,0.3)" />
    </Pressable>
  )
}

export default ChapterArrowUpButton

const styles = StyleSheet.create({
  arrowUp: {
    position: 'absolute',
    bottom: hp(5),
    right: wp(2),
    padding: wp(1),
    borderRadius: AppConstants.ICON.SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
})