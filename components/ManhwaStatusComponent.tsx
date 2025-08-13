import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


interface ManhwaStatusComponentProps {
    status: string
}


const ManhwaStatusComponent = ({ status }: ManhwaStatusComponentProps) => {

    const backgroundColor = status === "Completed" ? Colors.manhwaStatusCompleted : Colors.manhwaStatusOnGoing

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
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    }
})