import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { hp, wp } from '@/helpers/util'
import { dbGetCacheMaxSize } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import Toast from 'react-native-toast-message'
import CloseBtn from './buttons/CloseButton'
import Row from './util/Row'



const ICON_SIZE = 26


interface OptionProps {
    onPress: () => void
    iconColor?: string
    title: string
    iconName: string
    showLoading?: boolean
}


const Option = ({onPress, title, iconName, iconColor = Colors.white, showLoading = true}: OptionProps) => {

    const [loading, setLoading] = useState(false)

    const p = async () => {
        setLoading(true)
        await onPress()
        setLoading(false)
    }

    if (loading && showLoading) {
        return (
            <View
                style={styles.link}
                hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
                <View style={{padding: 5, backgroundColor: iconColor, borderRadius: 4}} >
                    <ActivityIndicator size={ICON_SIZE} color={Colors.backgroundColor} />
                </View>
                <Text style={[[AppStyle.textRegular, {fontSize: 16}]]}>{title}</Text>
            </View>
        )    
    }

    return (
        <Pressable 
            onPress={p} 
            style={styles.link} 
            hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
            <View style={{padding: 5, backgroundColor: iconColor, borderRadius: 4}} >
                <Ionicons name={iconName as any} size={ICON_SIZE} color={Colors.backgroundColor} />
            </View>
            <Text style={[[AppStyle.textRegular, {fontSize: 16}]]}>{title}</Text>
        </Pressable>
    )
}


interface LateralMenuProps {
    closeMenu: () => any
}

const LateralMenu = ({closeMenu}: LateralMenuProps) => {
        
    const db = useSQLiteContext()

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
        try {
            await Linking.openURL(AppConstants.URLS.REDDIT)
        } catch (error) {
          Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
        }
    }

    const openNews = () => {
        router.navigate("/(pages)/NewsPage")
    }

    const openGithub = async () => {
        try {
            await Linking.openURL(AppConstants.URLS.GITHUB)
        } catch (error) {
          Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
        }
    }

    const openReleases = () => {
        router.navigate("/(pages)/ReleasesPage")
    }

    const openSettings = async () => {
        const cache_size = (await dbGetCacheMaxSize(db) / 1024) / 1024
        router.navigate({
            pathname: "/(pages)/Settings",
            params: { cache_size }
        })
    }    

    return (
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={styles.container} >
                <Row style={{justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.yellow, fontFamily: "LeagueSpartan_600SemiBold"}]}>Menu</Text>
                    <CloseBtn onPress={closeMenu} color={Colors.yellow} />
                </Row>                

                <Option 
                    onPress={libraryPage} 
                    title='Library' 
                    iconName='library-outline'
                    showLoading={false}
                    iconColor={Colors.libraryColor}
                />                
                
                <Option 
                    onPress={readingHistoryPage} 
                    title='Reading History' 
                    iconName='book-outline'
                    showLoading={false}
                    iconColor={Colors.readingHistoryColor}
                />

                <Option 
                    onPress={openDonate} 
                    title='Donate' 
                    iconName='cash-outline'
                    showLoading={false}
                    iconColor={Colors.donateColor}
                />

                <Option 
                    onPress={openNews} 
                    title='News' 
                    iconName='newspaper-outline'
                    showLoading={false}
                    iconColor={Colors.newsColor}
                />

                <Option 
                    onPress={openManhwaRequest} 
                    title='Request Manhwa'
                    iconName='megaphone-outline'
                    showLoading={false}
                    iconColor={Colors.requestMangaColor}
                />

                <Option 
                    onPress={openReleases} 
                    title='Releases' 
                    iconName='git-branch-outline'
                    showLoading={false}
                    iconColor={Colors.releasesColor}
                />

                <Option 
                    onPress={openBugReport} 
                    title='Bug Report' 
                    iconName='bug-outline'
                    showLoading={false}
                    iconColor={Colors.BugReportColor}
                />

                <Option 
                    onPress={scansPage} 
                    title='Scans' 
                    iconName='earth-outline'
                    showLoading={false}
                    iconColor={Colors.scansColor}
                />

                <Option 
                    onPress={openReddit} 
                    title='Reddit' 
                    iconName='logo-reddit'
                    showLoading={false}
                    iconColor={Colors.redditColor}
                />

                <Option 
                    onPress={openGithub} 
                    title='GitHub' 
                    iconName='logo-github'
                    showLoading={false}
                    iconColor={Colors.white}
                />

                <Option 
                    onPress={openDisclaimer} 
                    title='EULA / Disclaimer' 
                    iconName='reader-outline'
                    showLoading={false}
                    iconColor={Colors.disclaimerColor}
                />

                <Option 
                    onPress={openSettings} 
                    title='Settings' 
                    iconName='settings-outline'
                    showLoading={false}
                    iconColor={'white'}
                />
                
                <View style={{height: 82}} />
            </View>            
        </ScrollView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        paddingHorizontal: wp(4),
        paddingTop: hp(4),       
        marginTop: 4, 
        marginBottom: 10 
    },
    link: {
        width: '100%',
        gap: 16,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})