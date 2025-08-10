import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'
import { AppConstants } from '../../constants/AppConstants'


const AppLogo = ({name = AppConstants.COMMON.APP_NAME}: {name?: string}) => {
  return (
    <View>
      <Text style={[AppStyle.textHeader, {fontSize: 30, fontFamily: 'LeagueSpartan_600SemiBold', color: Colors.yellow, textAlignVertical: 'center'}]}>
        {name}
      </Text>
    </View>
  )
}


export default AppLogo