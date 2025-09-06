import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { dbGetCacheMaxSize } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import MenuButton from './buttons/MenuButton'
import { AppStyle } from '@/styles/AppStyle'
import CloseBtn from './buttons/CloseButton'
import React, { useCallback } from 'react'
import { openUrl } from '@/helpers/util'
import { router } from 'expo-router'
import Footer from './util/Footer'
import TopBar from './TopBar'
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'


interface LateralMenuProps {
    closeMenu: () => any
}


const LateralMenu = ({closeMenu}: LateralMenuProps) => {
        
    const db = useSQLiteContext()    
    const openSettings = async () => {
        const cache_size = (await dbGetCacheMaxSize(db) / 1024) / 1024
        router.navigate({
            pathname: "/(pages)/Settings",
            params: { cache_size }
        })
    }

    const readingHistoryPage = useCallback(() => {
        router.navigate("/(pages)/ReadingHistoryPage")
    }, [])

    const libraryPage = useCallback(() => {
        router.navigate("/(pages)/LibraryPage")
    }, [])

    const scansPage = useCallback(() => {
        router.navigate("/(pages)/ScansPage")
    }, [])

    const openDonate = useCallback(() => {
        router.navigate("/(pages)/DonatePage")
    }, [])

    const openBugReport = useCallback(() => {
        router.navigate("/(pages)/BugReportPage")
    }, [])

    const openDisclaimer = useCallback(() => {
        router.navigate("/(pages)/EulaDisclaimerPage")
    }, [])

    const openPornhwaRequest = useCallback(() => {
        router.navigate("/(pages)/RequestManhwaPage")
    }, [])

    const openReddit = useCallback(async () => {
        await openUrl(AppConstants.URLS.PORNHWA_REDDIT)
    }, [])

    const openReleases = useCallback(() => {
        router.navigate("/(pages)/ReleasesPage")
    }, [])

    const openNewsPage = useCallback(() => {
        router.navigate("/(pages)/NewsPage")
    }, [])

    const openDownloads = useCallback(() => {
        router.navigate("/(pages)/DownloadPage")
    }, [])

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Menu'>
                <CloseBtn onPress={closeMenu} />
            </TopBar>
            <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false} >
                <View style={styles.container} >
                    <MenuButton 
                        onPress={libraryPage} 
                        title='Library'
                        iconName='library-outline'
                    />

                    <MenuButton 
                        onPress={openDownloads} 
                        title='Downloads'
                        iconName='download-outline'
                    />
                    
                    <MenuButton 
                        onPress={readingHistoryPage} 
                        title='Reading History' 
                        iconName='book-outline'
                    />

                    <MenuButton 
                        onPress={openDonate} 
                        title='Donate' 
                        iconName='cash-outline'
                    />                        

                    <MenuButton 
                        onPress={openPornhwaRequest} 
                        title='Request Pornhwa'
                        iconName='megaphone-outline'
                    />

                    <MenuButton 
                        onPress={openBugReport} 
                        title='Bug Report' 
                        iconName='bug-outline'
                    />

                    <MenuButton 
                        onPress={openReleases} 
                        title='Releases' 
                        iconName='git-branch-outline'
                    />

                    <MenuButton 
                        onPress={openNewsPage} 
                        title='News' 
                        iconName='newspaper-outline'
                    />

                    <MenuButton 
                        onPress={scansPage} 
                        title='Scans' 
                        iconName='earth-outline'
                    />

                    <MenuButton 
                        onPress={openReddit} 
                        title='Pornhwa'
                        iconName='logo-reddit'
                    />

                    <MenuButton
                        onPress={openSettings} 
                        title='Settings' 
                        iconName='settings-outline'
                    />                              

                    <Footer height={30} />
                </View>
            </ScrollView>
            <Pressable 
                onPress={openDisclaimer} 
                style={styles.disclaimer} 
                hitSlop={AppConstants.UI.HIT_SLOP.LARGE} >
                <Text style={Typography.lightUnderline} >eula & disclaimer</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 10,
        gap: AppConstants.UI.GAP * 2.2
    },
    disclaimer: {
        paddingBottom: 62, 
        alignItems: "center"
    }
})