import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { View } from 'react-native'
import React from 'react'


interface ActivityButtonIndicatorProps {
  backgroundColor?: string
}


const ActivityButtonIndicator = ({backgroundColor = Colors.primary}: ActivityButtonIndicatorProps) => {

  return (
    <View style={{...AppStyle.button, backgroundColor}} >
        <CustomActivityIndicator color={Colors.backgroundColor} />
    </View>
  )
}

export default ActivityButtonIndicator
