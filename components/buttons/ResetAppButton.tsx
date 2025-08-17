import { Pressable } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbResetApp } from '@/lib/database'
import RNRestart from 'react-native-restart';
import Toast from 'react-native-toast-message'

const ResetAppButton = () => {

    const db = useSQLiteContext()

    const onPress = async () => {
        Toast.show({text1: "Reseting..."})
        await dbResetApp(db)
        RNRestart.Restart();
    }

    return (
        <Pressable onPress={onPress} hitSlop={AppConstants.HIT_SLOP.NORMAL} >
            <Ionicons name='refresh-outline' size={AppConstants.ICON.SIZE} color={'white'} />
        </Pressable>
    )
}

export default ResetAppButton