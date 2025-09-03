import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import React from 'react'


interface ViewAllButtonProps {
    onPress: () => any
}


const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.UI.HIT_SLOP.NORMAL} >
      <Ionicons name='chevron-forward' size={AppConstants.UI.ICON.SIZE} color={'white'} />
    </Pressable>
  )
}

export default ViewAllButton
