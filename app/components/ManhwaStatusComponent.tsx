import { FontSizes, Typography } from '@/constants/typography'
import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface ManhwaStatusComponentProps {
    status: string
}


const ManhwaStatusComponent = ({ status }: ManhwaStatusComponentProps) => {
    const backgroundColor = status === "Completed" ? Colors.green : Colors.orange
    return (
        <View style={{...styles.container, backgroundColor}} >
            <Text style={styles.text}>{status}</Text>
        </View>
    )
}

export default ManhwaStatusComponent

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 6, 
        top: 6,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: AppConstants.UI.BORDER_RADIUS
    },
    text: {
        ...Typography.regular,
        fontSize: FontSizes.pp, 
        color: Colors.backgroundColor
    }
})