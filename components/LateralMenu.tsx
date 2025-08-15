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
import { Typography } from '@/constants/typography'


interface OptionProps {
    onPress: () => void
    title: string
    iconName: string
}


const Option = ({onPress, title, iconName}: OptionProps) => {    
    return (
        <Pressable 
            onPress={onPress}
            style={styles.optionButton} 
            hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
            <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.primary} />
            <Text style={Typography.regular}>{title}</Text>
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


const openReleases = () => {
    router.navigate("/(pages)/ReleasesPage")
}

const openNewsPage = () => {
    router.navigate("/(pages)/NewsPage")
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
                    <View style={{gap: AppConstants.COMMON.GAP * 2.8}} > 
                    
                        <Option 
                            onPress={libraryPage} 
                            title='Library'
                            iconName='library-outline'
                        />                
                        
                        <Option 
                            onPress={readingHistoryPage} 
                            title='Reading History' 
                            iconName='book-outline'
                        />

                        <Option 
                            onPress={openDonate} 
                            title='Donate' 
                            iconName='cash-outline'
                        />

                        <Option 
                            onPress={openNewsPage} 
                            title='News' 
                            iconName='newspaper-outline'
                        />

                        <Option 
                            onPress={openManhwaRequest} 
                            title='Request Manhwa'
                            iconName='megaphone-outline'
                        />

                        <Option 
                            onPress={openReleases} 
                            title='Releases' 
                            iconName='git-branch-outline'
                        />

                        <Option 
                            onPress={openBugReport} 
                            title='Bug Report' 
                            iconName='bug-outline'
                        />

                        <Option 
                            onPress={scansPage} 
                            title='Scans' 
                            iconName='earth-outline'
                        />

                        <Option 
                            onPress={openReddit} 
                            title='Reddit'
                            iconName='logo-reddit'
                        />

                        <Option 
                            onPress={openSettings} 
                            title='Settings' 
                            iconName='settings-outline'
                        />                              

                        <Footer height={30} />
                    </View>
                </View>
            </ScrollView>
            <Pressable 
                onPress={openDisclaimer} style={{paddingBottom: 62, alignItems: "center"}} 
                hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                <Text style={{...Typography.light, textDecorationLine: 'underline'}} >eula & disclaimer</Text>
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
    optionButton: {
        width: '100%',
        gap: AppConstants.COMMON.GAP,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})