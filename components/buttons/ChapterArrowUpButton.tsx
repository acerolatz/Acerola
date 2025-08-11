import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'

interface ChapterArrowUpButtonProps {
    onPress: () => any
}

const ChapterArrowUpButton = ({onPress}: ChapterArrowUpButtonProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}
        style={styles.arrowUp}>
        <Ionicons name="arrow-up-outline" size={20} color="rgba(0,0,0,0.3)" />
    </Pressable>
  )
}

export default ChapterArrowUpButton

const styles = StyleSheet.create({
  arrowUp: {
    position: 'absolute',
    bottom: 62,
    right: 12,
    padding: 6,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  }
})