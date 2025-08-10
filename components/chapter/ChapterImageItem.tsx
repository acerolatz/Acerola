// ChapterImageItem.tsx
import { AppConstants } from '@/constants/AppConstants';
import { ChapterImage } from '@/helpers/types';
import { wp } from '@/helpers/util';
import { dbAddNumericInfo } from '@/lib/database';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { PixelRatio, View } from 'react-native';


const MAX_WIDTH = wp(100);


type ChapterImageItemProps = {
  item: ChapterImage | 'BoxHeader' | 'BoxFooter';
};


const ChapterImageItem = React.memo(({ item }: ChapterImageItemProps) => {

  if (item === 'BoxHeader') {
    return <View style={{ width: '100%', height: AppConstants.PAGES.CHAPTER.HEADER_HEIGHT }} />;
  }

  if (item === 'BoxFooter') {
    return <View style={{ width: '100%', height: AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT }} />;
  }

  const width = Math.min(item.width, MAX_WIDTH);
  const height = PixelRatio.roundToNearestPixel((width * item.height) / item.width);
  
  return (
    <Image
      style={{ width, height }}
      source={item.image_url}
      contentFit="cover"
    />
  );
});

export default ChapterImageItem;