import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'


interface DonateButtonProps {
  size?: number
  color?: string
  iconName?: string
  onPress: () => any
}

const DonateButton = ({onPress, size = 28, color = Colors.white}: DonateButtonProps) => {

  return (
    <Pressable 
      onPress={onPress} 
      hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}
      style={AppStyle.buttonBackground} >
        <Ionicons name='cash-outline' size={size} color={color} />
    </Pressable>
  )
}

export default DonateButton