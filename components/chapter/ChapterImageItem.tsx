import { AppConstants } from '@/constants/AppConstants';
import { ChapterImage } from '@/helpers/types';
import { Image } from 'expo-image';
import React from 'react';
import { PixelRatio, View } from 'react-native';


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

  const width = Math.min(item.width, AppConstants.COMMON.SCREEN_WIDTH);
  const height = PixelRatio.roundToNearestPixel((width * item.height) / item.width);
  
  return (
    <Image
      style={{ width, height, alignSelf: "center" }}
      source={item.image_url}
      contentFit="cover"
      placeholder={require("@/assets/images/chapter-image-placeholder.png")}
      placeholderContentFit='cover'
      transition={200}
    />
  );
});


export default ChapterImageItem;