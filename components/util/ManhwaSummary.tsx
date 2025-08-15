import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Typography } from '@/constants/typography'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'

const MAX_LENGHT = 128

interface ManhwaSummaryProps {
    summary: string    
}

const ManhwaSummary = ({summary}: ManhwaSummaryProps) => {

    const [isTextExpanded, setIsTextExpanded] = useState(false)
    const t = isTextExpanded ? summary : summary.length > MAX_LENGHT ? summary.slice(0, MAX_LENGHT) + '...' : summary
    const showIcon = summary.length > MAX_LENGHT
    const iconName = isTextExpanded ? 'chevron-up' : 'chevron-down'

    useEffect(
        () => {
            const init = () => {
                setIsTextExpanded(false)
            }
            init()
        },
        [summary]
    )

    const onPress = () => {
        setIsTextExpanded(prev => !prev)
    }

    if (!showIcon) {
        return <Text style={Typography.regular}>{t}</Text>
    }

    if (isTextExpanded) {
        return (
            <View>
                <Text style={Typography.regular}>{t}</Text>                
                <Pressable 
                    onPress={onPress}
                    style={styles.button} 
                    hitSlop={AppConstants.HIT_SLOP.NORMAL}>
                    <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.white} />
                </Pressable>                
            </View>
        )
    }

    return (
        <View>
            <Text style={Typography.regular}>{t}</Text>
            <Pressable 
                onPress={onPress}
                style={styles.button} 
                hitSlop={AppConstants.HIT_SLOP.NORMAL}>
                <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.white} />
            </Pressable>
        </View>
    )
}

export default ManhwaSummary

const styles = StyleSheet.create({
    button: {
        width: '100%', 
        alignItems: "center", 
        justifyContent: "center"
    }    
})