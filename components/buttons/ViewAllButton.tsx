import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Pressable, Text } from 'react-native'

interface ViewAllButtonProps {
    onPress: () => any
}


const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.hitSlopLarge} >
        <Text style={[AppStyle.textRegular, {textDecorationLine: 'underline'}]}>view all</Text>
    </Pressable>
  )
}

export default ViewAllButton
