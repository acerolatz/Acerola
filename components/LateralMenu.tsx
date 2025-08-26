import { AppConstants } from '@/constants/AppConstants'
import { dbGetCacheMaxSize } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { openUrl } from '@/helpers/util'
import { router } from 'expo-router'
import React from 'react'
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import CloseBtn from './buttons/CloseButton'
import TopBar from './TopBar'
import Footer from './util/Footer'
import { Typography } from '@/constants/typography'
import MenuButton from './buttons/MenuButton'


const readingHistoryPage = () => {
    router.navigate("/(pages)/ReadingHistoryPage")
}

const libraryPage = () => {
    router.navigate("/(pages)/LibraryPage")
}

const scansPage = () => {
    router.navigate("/(pages)/ScansPage")
}

const openDonate = () => {
    router.navigate("/(pages)/DonatePage")
}

const openBugReport = () => {
    router.navigate("/(pages)/BugReportPage")
}

const openDisclaimer = () => {
    router.navigate("/(pages)/EulaDisclaimerPage")
}

const openPornhwaRequest = () => {
    router.navigate("/(pages)/RequestManhwaPage")
}

const openReddit = async () => {
    await openUrl(AppConstants.URLS.PORNHWA_REDDIT)
}

const openReleases = () => {
    router.navigate("/(pages)/ReleasesPage")
}

const openNewsPage = () => {
    router.navigate("/(pages)/NewsPage")
}

const openDocuments = () => {
    router.navigate("/(pages)/DocumentsPage")
}

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

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Menu'>
                <CloseBtn onPress={closeMenu} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={styles.container} >
                    <View style={{gap: AppConstants.GAP * 2.5, marginTop: AppConstants.GAP}} >                                     

                        <MenuButton 
                            onPress={libraryPage} 
                            title='Library'
                            iconName='library-outline'
                        />

                        <MenuButton 
                            onPress={openDocuments} 
                            title='Documents'
                            iconName='folder-outline'
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
                </View>
            </ScrollView>
            <Pressable 
                onPress={openDisclaimer} 
                style={styles.disclaimer} 
                hitSlop={AppConstants.HIT_SLOP.LARGE} >
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
        paddingTop: 10
    },
    disclaimer: {
        paddingBottom: 62, 
        alignItems: "center"
    }
})