import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
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
                <TopBar title='EULA' titleColor={Colors.disclaimerColor} >
                    <ReturnButton color={Colors.disclaimerColor} />
                </TopBar>
                <PageActivityIndicator color={Colors.disclaimerColor} />
            </SafeAreaView>
        )
    }

    if (EULA && DISCLAIMER) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='EULA' titleColor={Colors.disclaimerColor} >
                    <ReturnButton color={Colors.disclaimerColor} />
                </TopBar>
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                    <Text style={AppStyle.textRegular}>{EULA}</Text>
                    <View style={{width: '100%', height: 4, borderRadius: 4, marginVertical: 20, backgroundColor: Colors.disclaimerColor}} />
                    <Text style={[AppStyle.textHeader, {color: Colors.disclaimerColor}]}>Disclaimer</Text>
                    <Text style={AppStyle.textRegular}>{DISCLAIMER}</Text>
                    <Footer/>
                </ScrollView>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='EULA' titleColor={Colors.disclaimerColor} >
                <ReturnButton color={Colors.disclaimerColor} />
            </TopBar>
        </SafeAreaView>
    )
}


export default DisclaimerPage