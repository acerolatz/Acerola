import { AppConstants } from '@/constants/AppConstants'
import React from 'react'
import { Pressable, Text } from 'react-native'
import Row from '../util/Row'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FontSizes, Typography } from '@/constants/typography'


interface ViewAllButtonProps {
    onPress: () => any
}


const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.HIT_SLOP.NORMAL} >
      <Row>
        <Text style={[Typography.regular, {textAlignVertical: "center"}]}>more</Text>
        <Ionicons name='chevron-forward' size={AppConstants.ICON.SIZE} color={'white'} style={{top: FontSizes.sm / 4}} />
      </Row>
    </Pressable>
  )
}

export default ViewAllButton
