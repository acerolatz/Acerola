import AppVersion from '@/components/AppVersion'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { useAppVersionState } from '@/store/appVersionState'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView } from 'react-native'
import { spGetReleases } from '../../lib/supabase'
import ReleaseButton from '@/components/buttons/ReleaseButton'


const Releases = () => {

    const { allReleases, setAllReleases } = useAppVersionState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            let isCancelled = false
            async function init() {
                if (allReleases.length > 0) { return }
                setLoading(true)
                    const r = await spGetReleases()
                    if (isCancelled) { return }
                    setAllReleases(r)
                setLoading(false)
            }
            init()
            return () => { isCancelled = true }
        },
        []
    )

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Releases' titleColor={Colors.releasesColor} >
                    <ReturnButton color={Colors.releasesColor} />
                </TopBar>
                <AppVersion/>
                <PageActivityIndicator color={Colors.releasesColor}/>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            <AppVersion/>
            <FlatList
                data={allReleases}
                keyExtractor={(item) => item.url}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => <ReleaseButton release={item} />}
            />
        </SafeAreaView>
    )
}

export default Releases
