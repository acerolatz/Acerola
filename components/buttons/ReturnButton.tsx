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
  size = 28, 
  color = Colors.white, 
  onPress,
  backgroundColor = Colors.almostBlack
}: ReturnButtonProps) => {

  const router = useRouter();

  const tryGoBack = () => {
    if (router.canGoBack()) {
      try {
        router.back()
      } catch (e) {
        console.log(e)
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
      hitSlop={AppConstants.HIT_SLOP} >
        <Ionicons name='return-down-back-outline' size={size} color={color} />
    </Pressable>
  )
}

export default ReturnButton

const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 4
  }
})