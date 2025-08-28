import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { ToastMessages } from '@/constants/Messages'
import { dbGetRandomManhwaId } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { debounce } from 'lodash'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
    backgroundColor?: string    
}


const RandomManhwaButton = ({
    size = AppConstants.UI.ICON.SIZE, 
    color = Colors.white
}: RandomManhwaButtonProps) => {
        
    const db = useSQLiteContext()    
    const [loading, setLoading] = useState(false)

    const handleOpenManhwa = useCallback(async () => {
        if (loading) return
        setLoading(true)
        try {
            const manhwa_id = await dbGetRandomManhwaId(db)
            if (manhwa_id === null) {
                Toast.show(ToastMessages.EN.NO_MANGAS)
            } else {
                router.navigate({ pathname: '/(pages)/ManhwaPage', params: { manhwa_id } })
            }
        } finally {
            setLoading(false)
        }
    }, [db, loading])

    const debounceSearch = useMemo(() => debounce(handleOpenManhwa, 200), [db])

    if (loading) {
        return (
            <ActivityIndicator size={size} color={color} />
        )
    }

    return (        
        <Pressable onPress={debounceSearch} hitSlop={AppConstants.UI.HIT_SLOP.NORMAL}>
            <Ionicons name='dice-outline' size={size} color={color}/>
        </Pressable>        
    )
}

export default RandomManhwaButton