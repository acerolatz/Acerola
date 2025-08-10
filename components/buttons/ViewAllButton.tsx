import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Pressable, Text } from 'react-native'
import Row from '../util/Row'
import Ionicons from '@expo/vector-icons/Ionicons'

interface ViewAllButtonProps {
    onPress: () => any
}


const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
      <Row style={{gap: 2}} >
        <Text style={[AppStyle.textRegular, {color: Colors.white}]}>more</Text>
        <Ionicons name='chevron-forward' size={14} color={'white'} style={{top: 4}} />
      </Row>
    </Pressable>
  )
}

export default ViewAllButton
