import BooleanRotatingButton from './BooleanRotatingButton'
import { AppConstants } from '@/constants/AppConstants'
import { hasInternetAvailable } from '@/helpers/util'
import { ToastMessages } from '@/constants/Messages'
import React, { useCallback, useRef } from 'react'
import { dbSyncDatabase } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'


interface UpdateDatabaseProps {
    iconSize?: number
    iconColor?: string    
}


const UpdateDatabaseButton = ({ 
    iconSize = AppConstants.ICON.SIZE, 
    iconColor = Colors.white 
}: UpdateDatabaseProps) => {

    const db = useSQLiteContext()
    const fetching = useRef(false) 

    const update = useCallback(async () => {
        if (fetching.current) return
        fetching.current = true

        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) {
            fetching.current = false
            Toast.show(ToastMessages.EN.NO_INTERNET)
            return
        }

        Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE)

        try {
            const n = await dbSyncDatabase(db)
            if (n === 0) {
                Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED1)
                return
            }
            Toast.show({ text1: 'Sync completed', text2: `Pornhwas: ${n}`, type: 'info' })
            router.replace('/(pages)/HomePage')
        } catch (error) {
            console.error(error)
        } finally {
            fetching.current = false
        }
    }, [db])    

    return (           
        <BooleanRotatingButton
            onPress={update} 
            iconSize={iconSize} 
            iconColor={iconColor}
        />
    )
}

export default UpdateDatabaseButton
