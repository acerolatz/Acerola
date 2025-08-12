import { Colors } from '@/constants/Colors'
import { dbGetAppVersion } from '@/lib/database'
import { useAppVersionState } from '@/store/appVersionState'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'

const AppVersion = () => {
    
    const db = useSQLiteContext()
    const { localVersion, setLocalVersion } = useAppVersionState()

    useEffect(
        () => {
            const init = async () => {
                if (localVersion) { return }
                await dbGetAppVersion(db).then(v => setLocalVersion(v))
            }
            init()
        },
        [db]
    )

    if (!localVersion) {
        return <></>
    }

    return (
        <View>
            <Text style={[AppStyle.textRegular, {marginBottom: 10, color: Colors.releasesColor}]} >
                Your app version is {localVersion}
            </Text>
        </View>        
    )
}


export default AppVersion
