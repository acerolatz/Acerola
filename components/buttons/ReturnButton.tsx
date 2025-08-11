import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'


interface ReturnButtonProps {
  size?: number
  color?: string
  onPress?: () => any
  backgroundColor?: string
}


const ReturnButton = ({
  size = AppConstants.COMMON.BUTTON.SIZE, 
  color = Colors.yellow, 
  onPress,
  backgroundColor = Colors.almostBlack
}: ReturnButtonProps) => {

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
      style={[styles.container, {backgroundColor}]}
      onPress={o} 
      hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
        <Ionicons name='return-down-back-outline' size={size} color={color} />
    </Pressable>
  )
}

export default ReturnButton

const styles = StyleSheet.create({
  container: {
    borderRadius: 4
  }
})