import AppLogo from '@/components/util/Logo';
import Row from '@/components/util/Row';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { dbSetLastRefresh, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts
} from '@expo-google-fonts/league-spartan';
import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';


const App = () => {

    const db = useSQLiteContext()
    const alreadyInited = useRef(false)

    let [fontsLoaded] = useFonts({
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_400Regular,        
        LeagueSpartan_600SemiBold,    
    });

    useEffect(
        () => {
            async function init() {    
                if (alreadyInited.current) { return }
                alreadyInited.current = true
                
                Image.clearMemoryCache()

                const state: NetInfoState = await NetInfo.fetch()
                if (!state.isConnected) {
                    Toast.show(ToastMessages.EN.NO_INTERNET)
                    router.replace("/(pages)/HomePage")
                    return
                }                

                const shouldUpdate = await dbShouldUpdate(db, 'server')
                if (shouldUpdate) {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE)
                    await dbSetLastRefresh(db, 'client')
                    await dbUpdateDatabase(db)
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED)
                }

                router.replace("/(pages)/HomePage")
            }
            init()
        },
        [fontsLoaded]
    )  

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={AppStyle.safeArea}/>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <Row style={{paddingRight: 2, marginTop: 10, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                <Row style={{gap: 16}} >
                    <Ionicons name='sync' size={28} color={Colors.white} />
                    <Ionicons name='search-outline' size={28} color={Colors.white} />
                    <Ionicons name='dice-outline' size={28} color={Colors.white} />
                    <Ionicons name='options-outline' size={28} color={Colors.white} />
                </Row>
            </Row>
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
                <ActivityIndicator size={32} color={Colors.neonRed} />
            </View>
        </SafeAreaView>
    )
}

export default App
