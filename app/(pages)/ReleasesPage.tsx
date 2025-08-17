import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import SourceCodeButton from '@/components/buttons/SourceCodeButton'
import { FlatList, SafeAreaView, View, Text } from 'react-native'
import { spFetchReleasesAndSourceCode } from '../../lib/supabase'
import ReleaseButton from '@/components/buttons/ReleaseButton'
import ReturnButton from '@/components/buttons/ReturnButton'
import { useAppVersionState } from '@/store/appVersionState'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import React, { useEffect, useState } from 'react'
import AppVersion from '@/components/AppVersion'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { StyleSheet } from 'react-native'


const Releases = () => {

    const { releasesInfo, setReleasesInfo } = useAppVersionState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            let isCancelled = false
            async function init() {
                if (releasesInfo.releases.length === 0 || releasesInfo.source.length === 0) {
                    setLoading(true)
                        const r = await spFetchReleasesAndSourceCode()
                        if (isCancelled) { return }
                        setReleasesInfo(r)
                    setLoading(false)
                }
            }
            init()
            return () => { isCancelled = true }
        },
        []
    )

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Releases'>
                    <ReturnButton/>
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases'>
                <ReturnButton/>
            </TopBar>
            <View style={styles.flatListContainer} >
                
                <Text style={Typography.semibold} >Source Code</Text>
                <FlatList
                    data={releasesInfo.source}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.url}
                    horizontal={true}
                    renderItem={({item}) => <SourceCodeButton item={item} />}
                />

                <Text style={Typography.semibold} >Packages</Text>
                <AppVersion/>
                <FlatList
                    data={releasesInfo.releases}
                    keyExtractor={(item) => item.url}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <ReleaseButton release={item} />}
                />
            </View>
        </SafeAreaView>
    )
}

export default Releases

const styles = StyleSheet.create({
    flatListContainer: {
        width: '100%',
        gap: AppConstants.GAP
    }    
})
