import { Typography } from '@/constants/typography'
import { StyleSheet, Text } from 'react-native'
import { Manhwa } from '@/helpers/types'
import ManhwaGrid from './ManhwaGrid'
import { router } from 'expo-router'
import React from 'react'


interface DownloadGridProps {
    manhwas: Manhwa[]
}


const DownloadGrid = ({manhwas}: DownloadGridProps) => {

    const onPress = (manhwa: Manhwa) => {
        router.navigate({
            pathname: "/DownloadedManhwaPage",
            params: {
                manhwa_id: manhwa.manhwa_id
            }
        })
    }

    if (manhwas.length == 0) {
        return (
            <Text style={Typography.regular} >You’ll find your downloads here.</Text>
        )
    }

    return (
        <ManhwaGrid
            onPress={onPress}
            manhwas={manhwas}
            showsVerticalScrollIndicator={false}
            showManhwaStatus={false}
        />
    )
}

export default DownloadGrid
