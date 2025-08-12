import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { openUrl } from '@/helpers/util'
import { dbGetCacheMaxSize } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
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


interface OptionProps {
    onPress: () => void
    backgroundColor: string
    title: string
    iconName: string
}


const Option = ({onPress, title, iconName, backgroundColor}: OptionProps) => {    
    return (
        <Pressable 
            onPress={onPress}
            style={styles.optionButton} 
            hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
            <View style={{padding: 8, backgroundColor, borderRadius: AppConstants.COMMON.BORDER_RADIUS}} >
                <Ionicons name={iconName as any} size={26} color={Colors.backgroundColor} />
            </View>
            <Text style={[[AppStyle.textRegular, {fontSize: 16}]]}>{title}</Text>
        </Pressable>
    )
}

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
    router.navigate("/(pages)/DisclaimerPage")
}

const openManhwaRequest = () => {
    router.navigate("/(pages)/RequestManhwaPage")
}

const openReddit = async () => {
    await openUrl(AppConstants.URLS.REDDIT)
}

const openNews = () => {
    router.navigate("/(pages)/NewsPage")
}

const openGithub = async () => {
    await openUrl(AppConstants.URLS.GITHUB)
}

const openReleases = () => {
    router.navigate("/(pages)/ReleasesPage")
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
            <TopBar title='Menu' titleColor={Colors.yellow} >
                <CloseBtn onPress={closeMenu} color={Colors.yellow} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={styles.container} >
                    <Option 
                        onPress={libraryPage} 
                        title='Library' 
                        iconName='library-outline'                        
                        backgroundColor={Colors.libraryColor}
                    />                
                    
                    <Option 
                        onPress={readingHistoryPage} 
                        title='Reading History' 
                        iconName='book-outline'                        
                        backgroundColor={Colors.readingHistoryColor}
                    />

                    <Option 
                        onPress={openDonate} 
                        title='Donate' 
                        iconName='cash-outline'                        
                        backgroundColor={Colors.donateColor}
                    />

                    <Option 
                        onPress={openNews} 
                        title='News' 
                        iconName='newspaper-outline'                        
                        backgroundColor={Colors.newsColor}
                    />

                    <Option 
                        onPress={openManhwaRequest} 
                        title='Request Manhwa'
                        iconName='megaphone-outline'
                        backgroundColor={Colors.requestMangaColor}
                    />

                    <Option 
                        onPress={openReleases} 
                        title='Releases' 
                        iconName='git-branch-outline'                        
                        backgroundColor={Colors.releasesColor}
                    />

                    <Option 
                        onPress={openBugReport} 
                        title='Bug Report' 
                        iconName='bug-outline'                        
                        backgroundColor={Colors.BugReportColor}
                    />

                    <Option 
                        onPress={scansPage} 
                        title='Scans' 
                        iconName='earth-outline'                        
                        backgroundColor={Colors.scansColor}
                    />

                    <Option 
                        onPress={openReddit} 
                        title='Reddit' 
                        iconName='logo-reddit'                        
                        backgroundColor={Colors.redditColor}
                    />

                    <Option 
                        onPress={openGithub} 
                        title='GitHub' 
                        iconName='logo-github'                        
                        backgroundColor={Colors.white}
                    />

                    <Option 
                        onPress={openDisclaimer} 
                        title='EULA / Disclaimer' 
                        iconName='reader-outline'                        
                        backgroundColor={Colors.disclaimerColor}
                    />

                    <Option 
                        onPress={openSettings} 
                        title='Settings' 
                        iconName='settings-outline'                        
                        backgroundColor={'white'}
                    />
                    
                    <Footer/>
                </View>            
            </ScrollView>
        </SafeAreaView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 12
    },
    optionButton: {
        width: '100%',
        gap: 12,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})