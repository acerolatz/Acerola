import { ChapterImage } from '@/helpers/types';
import { View } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';


type ChapterImageItemProps = {
  item: ChapterImage
};


function areEqual(prevProps: ChapterImageItemProps, nextProps: ChapterImageItemProps) {
  return prevProps.item.image_url === nextProps.item.image_url
}


const ChapterImageItem = React.memo(({ item }: ChapterImageItemProps) => {  
  return (

    <Image
      style={{ width: item.width, height: item.height }}
      source={item.image_url}      
      contentFit="cover"
      recyclingKey={item.image_url}
      decodeFormat='rgb'
      cachePolicy={'disk'}
    />
  )}, areEqual
)


export default ChapterImageItem;