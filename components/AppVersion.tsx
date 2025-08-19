import { Typography } from '@/constants/typography'
import { dbReadAppVersion } from '@/lib/database'
import { useAppVersionState } from '@/store/appVersionState'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect } from 'react'
import { Text } from 'react-native'

const AppVersion = () => {
    
    const db = useSQLiteContext()
    const { localVersion, setLocalVersion } = useAppVersionState()

    useEffect(
        () => {
            const init = async () => {
                if (localVersion) { return }
                await dbReadAppVersion(db).then(v => setLocalVersion(v))
            }
            init()
        },
        [db]
    )

    if (!localVersion) {
        return <></>
    }

    return (
        <Text style={Typography.light} >
            Your app version is {localVersion}
        </Text>
    )
}


export default AppVersion
