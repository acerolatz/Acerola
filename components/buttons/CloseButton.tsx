import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'


interface CloseBtnProps {
    onPress: () => void
    style?: StyleProp<ViewStyle>
    size?: number
    color?: string
}


const CloseBtn = ({
  onPress, 
  style,
  size = 28, 
  color = Colors.white
}: CloseBtnProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}
        style={[styles.container, style]}>
        <Ionicons name='close' size={size} color={color} />
    </Pressable>
  )
}

export default CloseBtn

const styles = StyleSheet.create({
  container: {
    padding: 8, 
    borderRadius: 32, 
    backgroundColor: Colors.backgroundColor
  }
})