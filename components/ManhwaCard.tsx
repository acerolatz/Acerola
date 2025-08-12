import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Manhwa } from '@/helpers/types';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';
import ChapterLink from './chapter/ChapterLink';
import ManhwaIdComponent from './ManhwaIdComponent';
import ManhwaStatusComponent from './ManhwaStatusComponent';


interface ManhwaCardProps {
    manhwa: Manhwa
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    styleProp?: StyleProp<ViewStyle>
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
    showManhwaStatus?: boolean
}


const ManhwaCard = ({
    manhwa,
    styleProp,    
    width = AppConstants.COMMON.MANHWA_COVER_DIMENSION.WIDTH,
    height = AppConstants.COMMON.MANHWA_COVER_DIMENSION.HEIGHT,
    marginRight = AppConstants.COMMON.MARGIN,
    marginBottom = 0,
    showChaptersPreview = true,
    shouldShowChapterDate = true,
    showManhwaStatus = true    
}: ManhwaCardProps) => {
    
    const mangaStatusColor = manhwa.status === "Completed" ?
        Colors.manhwaStatusCompleted : 
        Colors.manhwaStatusOnGoing    
    
    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);

    return (
        <View style={[{width, marginRight, marginBottom}, styleProp]} >
            <Pressable onPress={onPress}>
                <Image
                    source={manhwa.cover_image_url} 
                    contentFit='cover'
                    style={[{borderRadius: AppConstants.COMMON.BORDER_RADIUS, width, height}]}
                />
            </Pressable>
            <View style={styles.container} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{manhwa.title}</Text>
                {
                    showChaptersPreview && 
                    manhwa.chapters &&                    
                    <View style={{gap: 12, marginTop: 6}} >
                        {manhwa.chapters.map(
                            (item, index) => 
                                <ChapterLink 
                                    shouldShowChapterDate={shouldShowChapterDate} 
                                    key={item.chapter_id}
                                    manhwaTitle={manhwa.title}
                                    manhwa_id={manhwa.manhwa_id}
                                    index={index}
                                    chapter_name={item.chapter_name}
                                    chapter_created_at={item.created_at}
                                    chapter_id={item.chapter_id} />
                        )}
                    </View>
                }
            </View>
            {
                showManhwaStatus &&
                <ManhwaStatusComponent backgroundColor={mangaStatusColor} status={manhwa.status} />
            }
            <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} position='r' />
        </View>
    )
}


export default memo(ManhwaCard);


const styles = StyleSheet.create({    
    container: {
        paddingVertical: 10,  
        width: '100%'
    }    
})