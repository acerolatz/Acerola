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

const HomeButton = ({size = 28, color = Colors.white, iconName = 'home', backgroundColor = Colors.backgroundColor}: HomeButtonProps) => {

  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/HomePage')} 
      hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}
      style={[AppStyle.buttonBackground, {backgroundColor}]} >
        <Ionicons name={iconName as any} size={size} color={color} />
    </Pressable>
  )
}

export default HomeButton