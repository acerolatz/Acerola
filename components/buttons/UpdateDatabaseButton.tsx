import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { hasInternetAvailable } from '@/helpers/util'
import { dbCheckSecondsSinceLastRefresh, dbHasManhwas, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React from 'react'
import Toast from 'react-native-toast-message'
import BooleanRotatingButton from './BooleanRotatingButton'
import { AppConstants } from '@/constants/AppConstants'


interface UpdateDatabaseProps {
    iconSize?: number
    iconColor?: string,
    type: "server" | "client"
}


const UpdateDatabaseButton = ({
    iconSize = AppConstants.COMMON.BUTTON.SIZE, 
    iconColor = Colors.white,
    type
}: UpdateDatabaseProps) => {

    const db = useSQLiteContext()    

    const update = async () => {        
        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) { 
            Toast.show(ToastMessages.EN.NO_INTERNET)
            return 
        }        

        const shouldUpdate = await dbShouldUpdate(db, type)
        let hasMangas = true

        if (!shouldUpdate) {
            hasMangas = await dbHasManhwas(db)
        }
        
        if (!shouldUpdate && hasMangas) {
            const secondsUntilRefresh = await dbCheckSecondsSinceLastRefresh(db, type)
            Toast.show({
                text1: "Wait ⌛", 
                text2: `You can try again in ${secondsUntilRefresh} seconds`, 
                type: 'info',
                visibilityTime: 3000
            })
        } else {
            Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE)
            try {
                const n = await dbUpdateDatabase(db)
                if (n > 0) {
                    Toast.show({
                        text1: "Sync completed", 
                        text2: `Total: ${n} Manhwas`,
                        type: "info"
                    })
                    router.replace("/(pages)/HomePage")
                    return
                } else {
                    Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED1)
                }                
            } catch (error) {
                console.log(error)
            }
        }
        
    }

    return (           
        <BooleanRotatingButton 
            onPress={update} 
            iconSize={iconSize} 
            iconColor={iconColor}
        />
    )
}

export default UpdateDatabaseButton
