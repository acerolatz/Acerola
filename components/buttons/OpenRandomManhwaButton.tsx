import { ActivityIndicator, Pressable } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { ToastMessages } from '@/constants/Messages'
import { dbGetRandomManhwaId } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { router } from 'expo-router'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
    backgroundColor?: string    
}


const RandomManhwaButton = ({
    size = AppConstants.ICON.SIZE, 
    color = Colors.white
}: RandomManhwaButtonProps) => {
        
    const db = useSQLiteContext()    
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
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
        <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.HIT_SLOP.NORMAL}>
            <Ionicons name='dice-outline' size={size} color={color}/>
        </Pressable>        
    )
}

export default RandomManhwaButton