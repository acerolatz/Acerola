import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'
import { AppConstants } from '../../constants/AppConstants'


const AppLogo = () => {
  return (
    <View>
      <Text style={[AppStyle.textHeader, {fontSize: 30, fontFamily: 'LeagueSpartan_600SemiBold', color: Colors.yellow}]}>
        {AppConstants.COMMON.APP_NAME}
      </Text>
    </View>
  )
}


export default AppLogo