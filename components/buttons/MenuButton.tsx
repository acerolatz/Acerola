import { Pressable, StyleSheet, Text} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface MenuButtonProps {
    onPress: () => void
    title: string
    iconName: string
}


const MenuButton = ({onPress, title, iconName}: MenuButtonProps) => {    
    return (
        <Pressable
            onPress={onPress}
            style={styles.container} 
            hitSlop={AppConstants.HIT_SLOP.LARGE} >
            <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.primary} />
            <Text style={Typography.regular}>{title}</Text>
        </Pressable>
    )
}

export default MenuButton

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.GAP,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})