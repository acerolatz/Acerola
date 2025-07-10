import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native'


interface CButtonProps {
    style?: ViewStyle
    iconName: string
    iconSize?: number
    iconColor: string
    onPress: () => any
}

const CButton = ({iconName, iconColor, style, onPress, iconSize = 28}: CButtonProps) => {

    const [loading, setLoading] = useState(false)

    const handlePress = async () => {
        setLoading(true)
        await onPress()
        setLoading(false)
    }
  
    if (loading) {
        return (
            <View style={[style, {alignItems: "center", justifyContent: "center"}]} >
                <ActivityIndicator size={iconSize} color={iconColor} />
            </View>
        )
    }

    return (
        <Pressable onPress={handlePress} style={[style, {alignItems: "center", justifyContent: "center"}]} >
            <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
        </Pressable>
    )    
}

export default CButton

const styles = StyleSheet.create({})