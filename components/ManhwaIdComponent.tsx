import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface ManhwaIdComponentProps {
    manhwa_id: number
    position?: 'l' | 'r'
}

const ManhwaIdComponent = ({manhwa_id, position = 'l'}: ManhwaIdComponentProps) => {

    if (AppConstants.DEBUB.ENABLED) {
        return position === 'l' ?        
            <View style={[styles.container, {left: 6}]} >
                <Text style={Typography.regular}>{manhwa_id}</Text>
            </View>
            :
            <View style={[styles.container, {right: 6}]} >
                <Text style={Typography.regular}>{manhwa_id}</Text>
            </View>
        
    }

    return <></>
}

export default ManhwaIdComponent

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 6, 
        borderRadius: 42, 
        width: 42, 
        height: 42, 
        backgroundColor: Colors.backgroundSecondary, 
        alignItems: "center", 
        justifyContent: "center"
    }
})