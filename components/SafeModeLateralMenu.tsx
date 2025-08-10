import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
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
import { router } from 'expo-router'



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


interface SafeModeLateralMenuProps {
    closeMenu: () => any
}

const SafeModeLateralMenu = ({closeMenu}: SafeModeLateralMenuProps) => {
        
    const openSettings = () => {
        router.navigate("/(pages)/SafeModeSettings")
    }

    return (
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={styles.container} >
                <Row style={{justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.yellow, fontFamily: "LeagueSpartan_600SemiBold"}]}>Menu</Text>
                    <CloseBtn onPress={closeMenu} color={Colors.yellow} />
                </Row>                

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

export default SafeModeLateralMenu

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