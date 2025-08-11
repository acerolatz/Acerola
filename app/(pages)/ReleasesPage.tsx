import AppVersion from '@/components/AppVersion'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { AppRelease } from '@/helpers/types'
import { useAppVersionState } from '@/store/appVersionState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native'
import { spGetReleases } from '../../lib/supabase'
import { openUrl } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'


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

    const renderItem = ({item}: {item: AppRelease}) => {
        return (
            <Pressable onPress={async () => openUrl(item.url)} style={styles.item}>
                <Row style={{width: '100%', justifyContent: "space-between"}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]} >{item.version}</Text>
                    <Ionicons name='download-outline' size={28} color={Colors.backgroundColor} />
                </Row>
                {
                    item.action &&
                    <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, fontSize: 20}]} >{item.action}</Text>
                }
            </Pressable>
        )
    }

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
                renderItem={renderItem}
            />
        </SafeAreaView>
    )
}

export default Releases

const styles = StyleSheet.create({
    item: {
        width: '100%', 
        padding: 10,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
        backgroundColor: Colors.releasesColor, 
        marginBottom: AppConstants.COMMON.MARGIN
    }
})