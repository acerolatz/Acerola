import AppLogo from '@/components/util/Logo';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import Row from '@/components/util/Row';
import { ToastMessages } from '@/constants/Messages';
import { clearCache } from '@/helpers/util';
import { dbFirstRun, dbSetLastRefresh, dbShouldClearCache, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts
} from '@expo-google-fonts/league-spartan';
import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';


const App = () => {

    const db = useSQLiteContext()    

    let [fontsLoaded] = useFonts({
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_400Regular,
        LeagueSpartan_600SemiBold
    });

    useEffect(
        () => {
            async function init() {
                
                if (await dbShouldClearCache(db)) {
                    await clearCache()
                }
                
                await dbFirstRun(db)
                
                const state: NetInfoState = await NetInfo.fetch()
                if (!state.isConnected) {
                    Toast.show(ToastMessages.EN.NO_INTERNET)
                    router.replace("/(pages)/HomePage")
                    return
                }                

                if (await dbShouldUpdate(db, 'server')) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE)
                    await dbSetLastRefresh(db, 'client')
                    const n = await dbUpdateDatabase(db)
                    n > 0 ?
                        Toast.show({ text1: "Sync completed", text2: `Total: ${n} Manhwas`, type: "info" }) :
                        Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED)
                }
                                
                router.replace("/(pages)/HomePage")
            }
            init()
        },
        [db]
    )  

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={AppStyle.safeArea}/>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <Row style={styles.container} >
                <AppLogo/>
                <Ionicons name='options-outline' size={28} color={'white'} />
            </Row>
            <PageActivityIndicator/>
        </SafeAreaView>
    )
}

export default App

const styles = StyleSheet.create({
    container: {
        paddingRight: 2, 
        marginTop: 10, 
        marginBottom: 10, 
        justifyContent: "space-between"
    }
})