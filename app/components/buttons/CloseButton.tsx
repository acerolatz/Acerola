import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import React from 'react'


interface CloseBtnProps {
    onPress: () => void
}


const CloseBtn = ({ onPress }: CloseBtnProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.UI.HIT_SLOP.LARGE}>
        <Ionicons name='close-outline' size={AppConstants.UI.ICON.SIZE} color={Colors.primary} />
    </Pressable>
  )
}

export default CloseBtn