import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import SettingsForm from '@/components/form/SettingsForm'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { getCacheSizeBytes } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

const Settings = () => {

    const params = useLocalSearchParams()
    const cache_size = params.cache_size as any

    const [currentCacheSize, setCurrentCacheSize] = useState<number>()

    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    const c = await getCacheSizeBytes()
                    setCurrentCacheSize(c)
                setLoading(false)
            }
            init()
        },
        []
    )

    if (loading) {
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
            <SettingsForm currentMaxCacheSize={cache_size} currentCacheSize={currentCacheSize!} />
        </SafeAreaView>
    )
}

export default Settings

const styles = StyleSheet.create({})