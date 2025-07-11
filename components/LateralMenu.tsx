import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { dbClearTable } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
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
                hitSlop={AppConstants.hitSlop} >
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
            hitSlop={AppConstants.hitSlop} >
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
    const router = useRouter()
    const { session, logout } = useAuthState()
    
    const accountPage = () => {
        router.navigate("/(pages)/AccountPage")
    }

    const loginPage = () => {
        router.navigate("/(auth)/SignInPage")
    }

    const readingHistoryPage = () => {
        router.navigate("/(pages)/ReadingHistoryPage")
    }

    const libraryPage = () => {
        router.navigate("/(pages)/LibraryPage")
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

    const handleLogout = async () => {
        await supabase.auth.signOut().catch(e => console.log(e))
        await dbClearTable(db, 'reading_status')
        logout()
    }

    const openManhwaRequest = () => {
        router.navigate("/(pages)/RequestManhwaPage")
    }

    const openReleases = () => {
        router.navigate("/(pages)/ReleasesPage")
    }

    return (
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={styles.container} >
                <Row style={{justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.orange, fontFamily: "LeagueSpartan_600SemiBold"}]}>Menu</Text>
                    <CloseBtn onPress={closeMenu} color={Colors.orange} />
                </Row>
            
                {
                    session ? 
                    <Option 
                        onPress={accountPage} 
                        title='Account' 
                        iconName='person-outline'
                        showLoading={false}
                        iconColor={Colors.accountColor}
                    />
                    :
                    <Option 
                        onPress={loginPage} 
                        title='Sign In/Register'
                        iconName='log-in'
                        showLoading={false}
                        iconColor={Colors.accountColor}
                    />
                }

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
                    onPress={openDisclaimer} 
                    title='Disclaimer' 
                    iconName='newspaper-outline'
                    showLoading={false}
                    iconColor={Colors.disclaimerColor}
                />                

                {
                    session &&
                    <Option 
                        onPress={handleLogout} 
                        title='Log out' 
                        iconName='log-out-outline'
                        iconColor={Colors.neonRed}
                    />
                }

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
        marginTop: 6, 
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