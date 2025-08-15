import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import SettingsForm from '@/components/form/SettingsForm'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { UserHistory } from '@/helpers/types'
import { formatNumberWithSuffix, getCacheSizeBytes } from '@/helpers/util'
import { dbGetUserHistory, dbIsSafeModeEnabled, dbReadSafeModePassword } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View, Text} from 'react-native'

const Settings = () => {

    const params = useLocalSearchParams()
    const cache_size = params.cache_size as any

    const db = useSQLiteContext()
    const [currentCacheSize, setCurrentCacheSize] = useState<number>()
    const [safeModePassword, setSafeModePassword] = useState<string | null>(null)
    const [safeModeOn, setSafeModeOn] = useState<boolean | null>(null)

    const [loading, setLoading] = useState(false)
    const [userHistory, setUserHistory] = useState<UserHistory>({chapters: 0, images: 0, manhwas: 0})

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await Promise.all([
                        dbIsSafeModeEnabled(db),
                        dbReadSafeModePassword(db),
                        dbGetUserHistory(db),
                        getCacheSizeBytes()
                    ]).then(([s, p, u, c]) => {
                        setSafeModeOn(s),
                        setSafeModePassword(p),
                        setUserHistory(u),
                        setCurrentCacheSize(c)
                    })
                setLoading(false)
            }
            init()
        },
        []
    )

    if (loading || safeModePassword === null || safeModeOn === null) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Settings'>
                    <ReturnButton/>
                </TopBar>      
                <PageActivityIndicator/>
            </SafeAreaView>    
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Settings'>
                <ReturnButton/>
            </TopBar>

            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} >
                    <View style={{gap: AppConstants.COMMON.GAP}} >
                        <Text style={Typography.semibold}>History</Text>
                        <Row style={{justifyContent: "flex-start", gap: AppConstants.COMMON.GAP}} >
                            <Text style={Typography.regular}>{formatNumberWithSuffix(userHistory.manhwas)} pornhwas</Text>
                            <Text style={Typography.regular}>{formatNumberWithSuffix(userHistory.chapters)} chapters</Text>
                            <Text style={Typography.regular}>{formatNumberWithSuffix(userHistory.images)} images</Text>
                        </Row>
                        <SettingsForm 
                            currentMaxCacheSize={cache_size} 
                            currentCacheSize={currentCacheSize!} 
                            safeModePassword={safeModePassword}
                            safeModeOn={safeModeOn} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Settings