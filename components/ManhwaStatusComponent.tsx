import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


interface ManhwaStatusComponentProps {
    status: string
    backgroundColor: string
}


const ManhwaStatusComponent = ({ status, backgroundColor }: ManhwaStatusComponentProps) => {
    return (
        <View style={[styles.container, {backgroundColor}]} >
            <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.backgroundColor}]}>{status}</Text>
        </View>
    )
}

export default ManhwaStatusComponent

const styles = StyleSheet.create({
    container: {
        position: 'absolute', 
        left: 6, 
        top: 6, 
        borderRadius: 22,
        paddingHorizontal: 8,
        paddingVertical: 6
    }
})