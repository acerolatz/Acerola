import { Pressable, FlatList, View, Text, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import ManhwaIdComponent from "../ManhwaIdComponent"
import { AppConstants } from "@/constants/AppConstants"
import { Typography } from "@/constants/typography"
import { useEffect, useState, useRef, useCallback } from "react"
import { spFetchLatestManhwaCardsDebug } from "@/lib/supabase"
import { hp, wp } from "@/helpers/util"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Colors } from "@/constants/Colors"


type DebugManhwaCard = {
    title: string, 
    manhwa_id: number, 
    image_url: string
}

interface DebugManhwaCardComponentProps {
    item: DebugManhwaCard
    setCardToShow: React.Dispatch<React.SetStateAction<string | null>>    
}

const DebugManhwaCardComponent = ({item, setCardToShow}: DebugManhwaCardComponentProps) => {
    return (
        <Pressable onPress={() => setCardToShow(item.image_url)} >
            <Image
                source={item.image_url} 
                style={styles.image} 
                contentFit='contain' />
            <LinearGradient     
                colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.6)']} 
                style={StyleSheet.absoluteFill}
                pointerEvents='none' />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>{item.title}</Text>
            </View>
            <ManhwaIdComponent manhwa_id={item.manhwa_id} />
        </Pressable>
    )
}


interface LastestManhwaCardsProps {
    setCardToShow: React.Dispatch<React.SetStateAction<string | null>>   
}



const DebugLastestManhwaCards = ({setCardToShow}: LastestManhwaCardsProps) => {

    const [manhwas, setManhwas] = useState<DebugManhwaCard[]>([])
    const flatListRef = useRef<FlatList>(null)
    const manhwasRef = useRef<DebugManhwaCard[]>([])
    const fetching = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)

    useEffect(() => {
        const init = async () => {
            fetching.current = true
            const m = await spFetchLatestManhwaCardsDebug(0, AppConstants.VALIDATION.PAGE_LIMIT)
            setManhwas(m)
            manhwasRef.current = m
            hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
            fetching.current = false
        }
        init()
    }, [])

    const onEndReached = useCallback(async () => {
        if (fetching.current || !hasResults.current) { return }
        fetching.current = true    
        page.current += 1
        const m = await spFetchLatestManhwaCardsDebug(page.current, AppConstants.VALIDATION.PAGE_LIMIT)
        if (m.length) {
          manhwasRef.current.push(...m)
          setManhwas([...manhwasRef.current])
          hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
        }
        fetching.current = false
      }, [])

    const renderItem = useCallback(({item}: {item: DebugManhwaCard}) => (
        <DebugManhwaCardComponent item={item} setCardToShow={setCardToShow} />
    ), [])

    const keyExtractor = useCallback((item: DebugManhwaCard) => item.manhwa_id.toString(), [])

    const itemSeparator = useCallback(() => <View style={{width: AppConstants.UI.MARGIN}} />, [])

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={manhwas}
                windowSize={5}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={itemSeparator}
                onEndReachedThreshold={2}
                horizontal={true}
                onEndReached={onEndReached}
            />
            <Pressable onPress={() => flatListRef.current?.scrollToIndex({index: 0, animated: true})} style={styles.arrow} >
                <Ionicons name="chevron-back-outline" size={AppConstants.UI.ICON.SIZE} color={Colors.white} />
            </Pressable>
        </View>        
    )
}


export default DebugLastestManhwaCards;

const styles = StyleSheet.create({
    image: {
        width: wp(46), 
        height: hp(35), 
        borderRadius: AppConstants.UI.BORDER_RADIUS
    },
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(2),
        paddingRight: wp(2),
        bottom: 10
    },
    arrow: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        padding: AppConstants.UI.GAP,
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        backgroundColor: Colors.backgroundColor
    }
})