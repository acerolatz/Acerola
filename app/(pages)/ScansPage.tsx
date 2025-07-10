import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { spFetchScans } from '@/lib/supabase'
import { useScanState } from '@/store/scansState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'


const TEXT = "All images featured in our application are self-hosted on Cloudflare's storage services. This infrastructure ensures reliable and efficient delivery of content to our users.\n\nIt is important to note that while we self-host these images, their original sources are various public scanlator groups across the internet.\n\nWe wish to emphasize that all content made available through our application is exclusively derived from chapters that scanlators have publicly released under their free access tiers.\n\nWe understand that some scanlator groups operate subscription models or paid access systems for certain chapters. However, we strictly adhere to providing only content that has been made freely and publicly accessible by these scanlators.\n\nWe do not host or provide access to any content that requires a paid subscription or is restricted by a paywall from its original scanlator source."

const ScansPage = () => {

    const { scans, setScans } = useScanState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                if (scans.length == 0) {
                    setLoading(true)
                    await spFetchScans().then(v => setScans(v))
                    setLoading(false)
                }
            }
            init()
        },
        []
    )

    const openUrl = async (url: string) => {
        try {
            await Linking.openURL(url)
        } catch (error) {
          Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Scans' titleColor={Colors.scansColor} >
                    <ReturnButton color={Colors.scansColor} />
                </TopBar>
                <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
                    <ActivityIndicator size={28} color={Colors.scansColor} />
                </View>
            </SafeAreaView>
        )    
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Scans' titleColor={Colors.scansColor} >
                <ReturnButton color={Colors.scansColor} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={'always'} >
                <View style={styles.donateButton} >
                    <Text style={[AppStyle.textRegular, {fontSize: 20, color: Colors.backgroundColor}]} >                        
                        {TEXT}
                    </Text>
                </View>
                {
                    scans.map((item, index) => 
                        <Pressable key={index} onPress={() => openUrl(item.url)} style={styles.donateButton} >
                            <Column style={styles.donateTitleContainer} >
                                <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{item.name}</Text>
                                <Ionicons name='globe-outline' size={28} color={Colors.backgroundColor} />
                            </Column>
                        </Pressable>
                    )
                }
                <View style={{height: 62}} />
            </ScrollView>
        </SafeAreaView>
    )

}

export default ScansPage

const styles = StyleSheet.create({
    donateButton: {
    maxWidth: '100%', 
    padding: 10, 
    borderRadius: 4, 
    backgroundColor: Colors.scansColor, 
    marginBottom: 20,
    gap: 10
  },
  donateTitleContainer: {
    width: "100%", 
    flexDirection: 'row', 
    alignItems: "center", 
    gap: 10, 
    justifyContent: "space-between"
  }
})