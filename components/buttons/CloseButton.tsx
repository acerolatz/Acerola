import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'


interface CloseBtnProps {
    onPress: () => void   
    size?: number
    color?: string
}


const CloseBtn = ({onPress, size = 24, color = Colors.yellow}: CloseBtnProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}>
        <Ionicons name='close-outline' size={size} color={color} />
    </Pressable>
  )
}

export default CloseBtn