import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable } from 'react-native'


interface CloseBtnProps {
    onPress: () => void
}


const CloseBtn = ({ onPress }: CloseBtnProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}>
        <Ionicons name='close-outline' size={AppConstants.ICON.SIZE} color={Colors.primary} />
    </Pressable>
  )
}

export default CloseBtn