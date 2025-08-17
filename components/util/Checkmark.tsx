import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import Row from './Row'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import CustomActivityIndicator from './CustomActivityIndicator'


interface CheckmarkProps {
    title: string
    value: boolean
    check: () => any
}

const Checkmark = ({title, value, check}: CheckmarkProps) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        await check()
        setLoading(false)
    }

    if (loading) {
        return (
            <Row style={styles.container} >
                <Text style={{...Typography.regular, flexShrink: 1}} >{title}</Text>
                <View style={{alignItems: "center", justifyContent: "center"}} >
                    <CustomActivityIndicator size={AppConstants.ICON.SIZE * 0.8} />
                </View>
            </Row>
        )
    }

    if (value) {
        return (
            <Row style={styles.container} >
                <Text style={{...Typography.regular, flexShrink: 1}} >{title}</Text>
                <Pressable onPress={onPress} style={styles.buttonMarked} hitSlop={AppConstants.HIT_SLOP.LARGE}>
                    <Ionicons 
                        name='checkmark-outline' 
                        size={AppConstants.ICON.SIZE} 
                        color={Colors.backgroundColor} />
                </Pressable>
            </Row>
        )
    }
    
    return (
        <Row style={styles.container} >
            <Text style={{...Typography.regular, flexShrink: 1}} >{title}</Text>
            <Pressable 
                style={styles.button}
                onPress={onPress}
                hitSlop={AppConstants.HIT_SLOP.LARGE} />
        </Row>
    )
}

export default Checkmark

const styles = StyleSheet.create({
    container: {
        gap: AppConstants.GAP,
        justifyContent: "space-between"
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        width: AppConstants.ICON.SIZE,
        height: AppConstants.ICON.SIZE,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: AppConstants.BORDER_RADIUS
    },
    buttonMarked: {
        alignItems: "center",
        justifyContent: "center",
        width: AppConstants.ICON.SIZE,
        height: AppConstants.ICON.SIZE,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: AppConstants.BORDER_RADIUS,
        backgroundColor: Colors.primary
    }
})