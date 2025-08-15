import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Typography } from '@/constants/typography'
import { spFetchEulaAndDisclaimer } from '@/lib/supabase'
import { useTextState } from '@/store/appTextState'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'


const DisclaimerPage = () => {

    const { textMap, setTextMap } = useTextState()
    const [loading, setLoading] = useState(false)

    const EULA = textMap.get('eula')
    const DISCLAIMER = textMap.get('disclaimer')

    useEffect(
        () => {
            let isCancelled = false
            const init = async () => {
                if (textMap.size === 0) {
                    setLoading(true)
                        const d = await spFetchEulaAndDisclaimer()
                        if (isCancelled) { return }
                        const m =  new Map<string, string>(d.map(i => [i.name, i.value]))
                        setTextMap(m)
                    setLoading(false)
                }
            }
            init()
            return () => { isCancelled = true }
        },
        [textMap]
    )

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='EULA & Disclaimer'>
                    <ReturnButton/>
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
    }

    if (EULA && DISCLAIMER) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='EULA & Disclaimer'>
                    <ReturnButton/>
                </TopBar>
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                    <View style={{gap: 10}} >
                        <Text style={Typography.regular}>{EULA}</Text>
                        <TopBar title='Disclaimer'/>
                        <Text style={Typography.regular}>{DISCLAIMER}</Text>
                    </View>
                    <Footer/>
                </ScrollView>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='EULA & Disclaimer'>
                <ReturnButton/>
            </TopBar>
        </SafeAreaView>
    )
}


export default DisclaimerPage