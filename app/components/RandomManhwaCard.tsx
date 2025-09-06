import { spFetchManhwaById, spUpdateManhwaCardView } from '@/lib/supabase'
import CustomActivityIndicator from './util/CustomActivityIndicator'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { dbHasManhwa, dbUpsertManhwa } from '@/lib/database'
import { ManhwaCard, ServerManhwa } from '@/helpers/types'
import { AppConstants } from '@/constants/AppConstants'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useState } from 'react'
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { router } from 'expo-router'
import { wp } from '@/helpers/util'
import { Image } from 'expo-image'


interface RandomManhwaCardProps {
    card: ManhwaCard    
}


function areEqual(prev: RandomManhwaCardProps, next: RandomManhwaCardProps) {
  return prev.card.image_url === next.card.image_url
}


const RandomManhwaCard = React.memo(({ card }: RandomManhwaCardProps) => {

    const db = useSQLiteContext()
    
    const [loading, setLoading] = useState(false)    

    const onPress = useCallback(async () => {
        const hasManhwa = await dbHasManhwa(db, card.manhwa_id)
        if (!hasManhwa) {
            setLoading(true)
                const m: ServerManhwa | null = await spFetchManhwaById(card.manhwa_id)
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
            params: { manhwa_id: card.manhwa_id }
        })
    }, [card.manhwa_id])

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
        <Pressable onPress={onPress} style={{width: card.normalizedWidth, height: card.normalizedHeight}} >
            <Image 
                source={card.image_url} 
                style={{
                    width: card.normalizedWidth,
                    height: card.normalizedHeight,
                    borderRadius: AppConstants.UI.BORDER_RADIUS * 2
                }} 
                transition={AppConstants.UI.ANIMATION_TIME}
                contentFit='cover' />
            <LinearGradient 
                colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.6)']} 
                style={StyleSheet.absoluteFill}
                pointerEvents='none' />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>{card.title}</Text>
            </View>
        </Pressable>
    )
}, areEqual)

export default RandomManhwaCard

const styles = StyleSheet.create({
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(2),
        paddingRight: wp(2),
        bottom: 24
    }
})