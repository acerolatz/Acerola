import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { spFetchScans } from '@/lib/supabase'
import { useScanState } from '@/store/scansState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'


const ScansPage = () => {

    const { scans, setScans, title, setTitle } = useScanState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                if (scans.length != 0) {
                    return
                }
                setLoading(true)
                    const r = await spFetchScans()
                    const t = r.find(i => i.name === 'title')
                    setScans(r.filter(i => i.name != "title"))
                    setTitle(t ? t.url : null)
                setLoading(false)
            }
            init()
        },
        [scans]
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
                    <Text style={[AppStyle.textRegular, {fontSize: 20, color: AppConstants.TEXT.COLOR.DARK}]} >
                        {title}
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
    marginBottom: 10,
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