import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'


const AppLogo = () => {
  return (
    <View>
      <Text style={[AppStyle.textHeader, {fontSize: 30, fontFamily: 'LeagueSpartan_600SemiBold', color: Colors.orange}]}>Ougi</Text>
    </View>
  )
}


export default AppLogo