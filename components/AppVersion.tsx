import { Colors } from '@/constants/Colors'
import { useAppVersionState } from '@/store/appVersionState'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'

const AppVersion = () => {

    const { localVersion } = useAppVersionState()

    if (!localVersion) {
        return <></>
    }

    return (
        <View>
            <Text style={[AppStyle.textRegular, {marginBottom: 10, color: Colors.releasesColor}]} >
                Your app version: {localVersion}
            </Text>
        </View>        
    )
}


export default AppVersion
