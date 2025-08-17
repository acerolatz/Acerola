import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'


interface HomeButtonProps {
  size?: number
  color?: string
  iconName?: string
  backgroundColor?: string
}

const HomeButton = ({
  size = AppConstants.ICON.SIZE, 
  color = Colors.white, 
  iconName = 'home'
}: HomeButtonProps) => {

  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/HomePage')} 
      hitSlop={AppConstants.HIT_SLOP.LARGE}>
        <Ionicons name={iconName as any} size={size} color={color} />
    </Pressable>
  )
}

export default HomeButton