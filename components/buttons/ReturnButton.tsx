import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'


interface ReturnButtonProps {  
  onPress?: () => any
  color?: string
}


const ReturnButton = ({onPress, color = Colors.primary}: ReturnButtonProps) => {

  const router = useRouter();

  const tryGoBack = () => {
    if (router.canGoBack()) {
      try {
        router.back()
      } catch (error) {
        console.log("error tryGoBack", error)
        router.replace("/(pages)/HomePage")
      }
    } else {
      router.replace("/(pages)/HomePage")
    }
  }

  const o = onPress ? onPress : tryGoBack

  return (
    <Pressable
      onPress={o} 
      hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
        <Ionicons name='return-down-back-outline' size={AppConstants.ICON.SIZE} color={color} />
    </Pressable>
  )
}

export default ReturnButton