import { AppConstants } from '@/constants/AppConstants';
import { Manhwa } from '@/helpers/types';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import {
    ColorValue,
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
    onPress?: (manhwa: Manhwa) => any
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    showManhwaStatus?: boolean
}


const LINEAR_COLORS = ['transparent', 'transparent', 'rgba(0, 0, 0, 0.7)']


const ManhwaCard = ({
    manhwa,
    onPress,
    width = wp(70),
    height = hp(50),
    marginRight = AppConstants.UI.MARGIN,
    marginBottom = 0,
    showManhwaStatus = true    
}: ManhwaCardProps) => {        
    const defaultOnPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);    

    const o = onPress ? onPress : defaultOnPress

    return (
        <Pressable onPress={() => o(manhwa)} style={{width, height, marginBottom, marginRight}} >
            <Image
                source={manhwa.cover_image_url} 
                contentFit='cover'                
                cachePolicy={'disk'}
                style={{width, height, borderRadius: AppConstants.UI.BORDER_RADIUS}}
                transition={AppConstants.UI.ANIMATION_TIME}
            />
            { showManhwaStatus && <ManhwaStatusComponent status={manhwa.status} /> }
            <LinearGradient 
                colors={LINEAR_COLORS as any} 
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
        gap: AppConstants.UI.GAP
    },
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(1),
        bottom: wp(1),
        paddingRight: wp(1.2)
    }    
})