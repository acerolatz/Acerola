import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { dbGetRandomManhwaId } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import Toast from 'react-native-toast-message'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
    backgroundColor?: string
    onPress?: () => any
}


const RandomManhwaButton = ({
    size = AppConstants.ICON.SIZE, 
    color = Colors.white,    
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
            <ActivityIndicator size={size} color={color} />
        )
    }

    return (        
        <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
            <Ionicons name='dice-outline' size={size} color={color}/>
        </Pressable>        
    )
}

export default RandomManhwaButton