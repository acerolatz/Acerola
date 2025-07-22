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
    width = AppConstants.MANHWA_COVER_DIMENSION.width, 
    height = AppConstants.MANHWA_COVER_DIMENSION.height, 
    styleProp,
    marginRight = 10,
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
                    cachePolicy={'disk'}
                    style={[{borderRadius: 12, width, height}]}/>
            </Pressable>
            <View style={styles.container} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{manhwa.title}</Text>
                {
                    showChaptersPreview && 
                    manhwa.chapters &&
                    manhwa.chapters.map(
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
                    )
                }
            </View>
            {
                showManhwaStatus &&
                <ManhwaStatusComponent
                    style={{position: 'absolute', left: 6, top: 6, borderRadius: 12}}
                    status={manhwa.status}
                    paddingHorizontal={8}
                    paddingVertical={6}
                    fontSize={12}
                    backgroundColor={mangaStatusColor}
                    borderRadius={22}
                />
            }
            {
                AppConstants.DEBUG_MODE &&
                <View style={{position: 'absolute', right: 6, top: 6, borderRadius: 12, width: 42, height: 42, backgroundColor: Colors.backgroundColor, alignItems: "center", justifyContent: "center"}} >
                    <Text style={AppStyle.textRegular}>{manhwa.manhwa_id}</Text>
                </View>
            }
        </View>
    )
}


export default memo(ManhwaCard);


const styles = StyleSheet.create({    
    container: {
        paddingVertical: 10,  
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4        
    }
})