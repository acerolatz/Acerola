import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Pressable, Text } from 'react-native'

interface ViewAllButtonProps {
    onPress: () => any
}


const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
        <Text style={[AppStyle.textRegular, {textDecorationLine: 'underline', color: Colors.white}]}>view all</Text>
    </Pressable>
  )
}

export default ViewAllButton
