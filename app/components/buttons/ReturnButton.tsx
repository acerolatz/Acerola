import { AppConstants } from '@/constants/AppConstants'
import { dbIsSafeModeEnabled } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import React from 'react'


interface ReturnButtonProps {  
  onPress?: () => any
  color?: string
}


const ReturnButton = ({onPress, color = Colors.primary}: ReturnButtonProps) => {

  const db = useSQLiteContext()
  const router = useRouter();

  const tryGoBack = async () => {
    if (router.canGoBack()) {
      try {
        router.back()
      } catch (error) {
        console.log("error tryGoBack", error)
        const isSafeModeEnabled = await dbIsSafeModeEnabled(db)
        isSafeModeEnabled ?
          router.replace("/(pages)/SafeModeHomePage") :
          router.replace("/(pages)/HomePage")
      }
    } else {
      const isSafeModeEnabled = await dbIsSafeModeEnabled(db)
      isSafeModeEnabled ?
        router.replace("/(pages)/SafeModeHomePage") :
        router.replace("/(pages)/HomePage")
    }
  }

  const o = onPress ? onPress : tryGoBack

  return (
    <Pressable
      onPress={o} 
      hitSlop={AppConstants.UI.HIT_SLOP.NORMAL} >
        <Ionicons name='return-down-back-outline' size={AppConstants.UI.ICON.SIZE} color={color} />
    </Pressable>
  )
}

export default ReturnButton