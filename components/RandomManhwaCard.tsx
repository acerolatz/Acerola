import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Manhwa, ManhwaCard } from '@/helpers/types'
import { useSQLiteContext } from 'expo-sqlite'
import { dbHasManhwa, dbUpsertManhwa } from '@/lib/database'
import { spFetchManhwaById, spUpdateManhwaCardView } from '@/lib/supabase'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import { router } from 'expo-router'
import CustomActivityIndicator from './util/CustomActivityIndicator'
import { Image } from 'expo-image'
import { AppConstants } from '@/constants/AppConstants'
import { LinearGradient } from 'expo-linear-gradient'
import { Typography } from '@/constants/typography'
import { wp } from '@/helpers/util'


interface RandomManhwaCardProps {
    card: ManhwaCard
}

const RandomManhwaCard = ({card}: RandomManhwaCardProps) => {

    const db = useSQLiteContext()

    const [loading, setLoading] = useState(false)    

    const onPress = async () => {
        const hasManhwa = await dbHasManhwa(db, card.manhwa_id)
        if (!hasManhwa) {
            setLoading(true)
                const m: Manhwa | null = await spFetchManhwaById(card.manhwa_id)
                if (!m) {
                    Toast.show(ToastMessages.EN.INVALID_MANHWA)
                    return
                }
                await dbUpsertManhwa(db, m)
            setLoading(false)
        }
        spUpdateManhwaCardView(card.manhwa_id)
        router.navigate({
            pathname: '/ManhwaPage', 
            params: {
                manhwa_id: card.manhwa_id
        }})
    }

    if (loading) {
        return (
            <View style={{
                width: card.normalizedWidth, 
                height: card.normalizedHeight, 
                alignItems: 'center',
                justifyContent: "center"
            }} >
                <CustomActivityIndicator/>
            </View>
        )
    }

    return (
        <Pressable onPress={() => onPress()} >
            <Image 
                source={card.image_url} 
                style={{
                    width: card.normalizedWidth,
                    height: card.normalizedHeight,
                    borderRadius: AppConstants.BORDER_RADIUS * 2
                }} 
                transition={AppConstants.IMAGE_TRANSITION}
                contentFit='cover' />
            <LinearGradient colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.6)']} style={StyleSheet.absoluteFill} />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>{card.title}</Text>
            </View>
        </Pressable>
    )
}

export default RandomManhwaCard

const styles = StyleSheet.create({
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(2),
        paddingRight: wp(2),
        bottom: 24
    }
})