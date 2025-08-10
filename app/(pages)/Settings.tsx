import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import SettingsForm from '@/components/form/SettingsForm'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { getCacheSizeBytes } from '@/helpers/util'
import { dbIsSafeModeEnabled, dbReadSafeModePassword } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

const Settings = () => {

    const params = useLocalSearchParams()
    const cache_size = params.cache_size as any

    const db = useSQLiteContext()
    const [currentCacheSize, setCurrentCacheSize] = useState<number>()
    const [safeModePassword, setSafeModePassword] = useState<string | null>(null)
    const [safeModeOn, setSafeModeOn] = useState<boolean | null>(null)

    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await dbIsSafeModeEnabled(db).then(s => setSafeModeOn(s))
                    await dbReadSafeModePassword(db).then(p => setSafeModePassword(p))
                    const c = await getCacheSizeBytes()
                    setCurrentCacheSize(c)
                setLoading(false)
            }
            init()
        },
        []
    )

    if (loading || safeModePassword === null || safeModeOn === null) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Settings' titleColor={Colors.white} >
                    <ReturnButton color={Colors.white} />
                </TopBar>      
                <PageActivityIndicator color={Colors.white}/>      
            </SafeAreaView>    
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Settings' titleColor={Colors.white} >
                <ReturnButton color={Colors.white} />
            </TopBar>
            <SettingsForm 
                currentMaxCacheSize={cache_size} 
                currentCacheSize={currentCacheSize!} 
                safeModePassword={safeModePassword}
                safeModeOn={safeModeOn} />
        </SafeAreaView>
    )
}

export default Settings

const styles = StyleSheet.create({})