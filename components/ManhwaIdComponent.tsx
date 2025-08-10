import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'


interface ManhwaIdComponentProps {
    manhwa_id: number
    position?: 'l' | 'r'
}

const ManhwaIdComponent = ({manhwa_id, position = 'l'}: ManhwaIdComponentProps) => {

    if (AppConstants.COMMON.DEBUG_MODE) {
        return position === 'l' ?        
            <View style={[styles.container, {left: 6}]} >
                <Text style={AppStyle.textRegular}>{manhwa_id}</Text>
            </View>
            :
            <View style={[styles.container, {right: 6}]} >
                <Text style={AppStyle.textRegular}>{manhwa_id}</Text>
            </View>
        
    }

    return <></>
}

export default ManhwaIdComponent

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 6, 
        borderRadius: 4, 
        width: 42, 
        height: 42, 
        backgroundColor: Colors.backgroundColor, 
        alignItems: "center", 
        justifyContent: "center"
    }
})