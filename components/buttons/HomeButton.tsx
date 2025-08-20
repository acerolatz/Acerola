import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { Pressable } from 'react-native'
import { router } from 'expo-router'
import React from 'react'


interface HomeButtonProps {
  size?: number
  color?: string
  iconName?: string
  backgroundColor?: string
}


const HomeButton = ({
  size = AppConstants.ICON.SIZE, 
  color = Colors.backgroundColor, 
  iconName = 'home-outline'
}: HomeButtonProps) => {
  return (
    <Pressable 
      onPress={() => router.replace("/(pages)/HomePage")} 
      hitSlop={AppConstants.HIT_SLOP.LARGE}>
        <Ionicons name={iconName as any} size={size} color={color} />
    </Pressable>
  )
}


export default HomeButton