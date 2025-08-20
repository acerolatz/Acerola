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
    showManhwaStatus?: boolean    
}


const ManhwaCard = ({
    manhwa,
    width = wp(70),
    height = hp(50),
    marginRight = AppConstants.MARGIN,
    marginBottom = 0,
    showManhwaStatus = true    
}: ManhwaCardProps) => {        

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);    

    return (
        <Pressable onPress={onPress} style={{width, height, marginRight, marginBottom, gap: AppConstants.GAP}} >
            <Image
                source={manhwa.cover_image_url} 
                contentFit='cover'                
                cachePolicy={'disk'}
                style={[{width, height, borderRadius: AppConstants.BORDER_RADIUS}]}
                transition={AppConstants.DEFAULT_IMAGE_TRANSITION}
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


function areEqual(prev: ManhwaCardProps, next: ManhwaCardProps) {
  const prevM = prev.manhwa
  const nextM = next.manhwa

  return (
    prevM.manhwa_id === nextM.manhwa_id &&
    prevM.title === nextM.title &&
    prevM.status === nextM.status &&
    prevM.cover_image_url === nextM.cover_image_url &&
    prev.showManhwaStatus === next.showManhwaStatus    
  )
}


export default memo(ManhwaCard, areEqual);


const styles = StyleSheet.create({
    container: {
        gap: AppConstants.GAP
    },
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(1),
        bottom: wp(1),
        paddingRight: wp(1.2)
    },
    chapterLinkContainer: {
        width: '100%', 
        gap: AppConstants.MARGIN, 
        paddingRight: 6
    }
})