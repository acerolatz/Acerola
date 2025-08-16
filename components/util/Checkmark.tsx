import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import Row from './Row'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'


interface CheckmarkProps {
    title: string
    value: boolean
    check: () => any
}

const Checkmark = ({title, value, check}: CheckmarkProps) => {

    if (value) {
        return (
            <Row style={styles.container} >
                <Text style={{...Typography.regular, flexShrink: 1}} >{title}</Text>
                <Pressable style={styles.buttonMarked} onPress={check} >
                    <Ionicons name='checkmark-outline' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
                </Pressable>
            </Row>
        )
    }
    
    return (
        <Row style={styles.container} >
            <Text style={{...Typography.regular, flexShrink: 1}} >{title}</Text>
            <Pressable style={styles.button}  onPress={check} >
                
            </Pressable>
        </Row>
    )
}

export default Checkmark

const styles = StyleSheet.create({
    container: {
        gap: AppConstants.COMMON.GAP
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        width: AppConstants.ICON.SIZE,
        height: AppConstants.ICON.SIZE,
        padding: 2,
        borderWidth: 2,
        borderColor: Colors.white,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    },
    buttonMarked: {
        alignItems: "center",
        justifyContent: "center",
        width: AppConstants.ICON.SIZE,
        height: AppConstants.ICON.SIZE,
        padding: 2,
        borderWidth: 2,
        borderColor: Colors.white,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.white
    }
})