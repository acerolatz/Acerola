import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { dbGetRandomManhwaId } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
    backgroundColor?: string
    onPress?: () => any
}


const RandomManhwaButton = ({
    size = AppConstants.COMMON.BUTTON.SIZE, 
    color = Colors.white,
    backgroundColor = Colors.backgroundColor,
    onPress
}: RandomManhwaButtonProps) => {
        
    const db = useSQLiteContext()    
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
        onPress ? onPress() : null
        setLoading(true)
        const manhwa_id: number | null = await dbGetRandomManhwaId(db)
        if (manhwa_id === null) {
            Toast.show(ToastMessages.EN.NO_MANGAS)
            setLoading(false)
            return
        }        
        router.navigate({pathname: '/(pages)/ManhwaPage', params: {manhwa_id}})
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={[styles.container, {backgroundColor}]} >
                <ActivityIndicator size={size} color={color} />
            </View>
        )
    }

    return (
        <View style={[styles.container, {backgroundColor}]}  >
            <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
                <Ionicons name='dice-outline' size={size} color={color}/>
            </Pressable>
        </View>
    )
}

export default RandomManhwaButton


const styles = StyleSheet.create({
    container: {
        borderRadius: 4
    }
})