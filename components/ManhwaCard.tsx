import { AppConstants } from '@/constants/AppConstants';
import { Manhwa } from '@/helpers/types';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import {
    Pressable,    
    StyleSheet,
    Text,
    View    
} from 'react-native';
import ChapterLink from './chapter/ChapterLink';
import ManhwaIdComponent from './ManhwaIdComponent';
import ManhwaStatusComponent from './ManhwaStatusComponent';
import { Typography } from '@/constants/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { hp, wp } from '@/helpers/util';


interface ManhwaCardProps {
    manhwa: Manhwa
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
    showManhwaStatus?: boolean
}


const ManhwaCard = ({
    manhwa,
    width = wp(56),
    height = hp(44),
    marginRight = AppConstants.COMMON.MARGIN,
    marginBottom = 0,
    showChaptersPreview = true,
    shouldShowChapterDate = true,
    showManhwaStatus = true    
}: ManhwaCardProps) => {        

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);    

    return (
        <Pressable onPress={onPress} style={[{width, height, marginRight, marginBottom}]} >
            <Image
                source={manhwa.cover_image_url} 
                contentFit='cover'
                style={[{width, height, borderRadius: AppConstants.COMMON.BORDER_RADIUS}]}
                transition={AppConstants.COMMON.IMAGE_TRANSITION}
            />
            { showManhwaStatus && <ManhwaStatusComponent status={manhwa.status} /> }
            <LinearGradient 
                colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.7)']} 
                style={StyleSheet.absoluteFill} />
            <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} position='r' />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>{manhwa.title}</Text>
            </View>
        </Pressable>
    )
}


export default memo(ManhwaCard);


const styles = StyleSheet.create({
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(1),
        bottom: wp(1),
        paddingRight: wp(1.2)
    }    
})