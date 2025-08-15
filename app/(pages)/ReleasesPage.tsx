import AppVersion from '@/components/AppVersion'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, View, Text, ScrollView } from 'react-native'
import { spFetchReleasesAndSourceCode } from '../../lib/supabase'
import ReleaseButton from '@/components/buttons/ReleaseButton'
import { ReleaseWrapper } from '@/helpers/types'
import SourceCodeButton from '@/components/buttons/SourceCodeButton'
import { StyleSheet } from 'react-native'
import { useAppVersionState } from '@/store/appVersionState'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'


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
                    ItemSeparatorComponent={() => <View style={{ width: AppConstants.COMMON.MARGIN }} />}
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
        gap: AppConstants.COMMON.GAP
    }    
})
