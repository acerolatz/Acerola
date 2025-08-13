import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SourceCodeLink } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { openUrl } from '@/helpers/util'

const SourceCodeButton = ({item}: {item: SourceCodeLink}) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        await openUrl(item.url)
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={styles.container} >
                <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{item.name}</Text>
                <Ionicons name='globe-outline' size={AppConstants.COMMON.BUTTON.SIZE} color={Colors.backgroundColor} />
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={styles.container} >
            <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{item.name}</Text>
            <Ionicons name='globe-outline' size={AppConstants.COMMON.BUTTON.SIZE} color={Colors.backgroundColor} />
        </Pressable>
    )
}

export default SourceCodeButton

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        alignItems: "center",
        marginBottom: AppConstants.COMMON.MARGIN,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        justifyContent: "space-between",
        backgroundColor: Colors.sourceCodeColor
    }
})