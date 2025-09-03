import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppConstants } from '@/constants/AppConstants';
import { Typography } from '@/constants/typography';
import Toast from 'react-native-toast-message';
import { SQLiteProvider } from 'expo-sqlite';
import { Colors } from '@/constants/Colors';
import { dbMigrate } from '@/lib/database';
import { Stack } from 'expo-router';
import React from 'react';
import { wp } from '@/helpers/util';


const TOAST_CONFIG = {
  success: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.success}]} />
    </View>
  ),

  success1: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={{...styles.toast, backgroundColor: Colors.backgroundColor}}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.success}]} />
    </View>
  ),
  
  error: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.error}]} />
    </View>
  ),

  error1: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={{...styles.toast, backgroundColor: Colors.backgroundColor}}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.error}]} />
    </View>
  ),
  
  info: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.info}]} />
    </View>
  ),

  info1: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={{...styles.toast, backgroundColor: Colors.backgroundColor}}>
      <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
      <View style={[styles.leftBar, {backgroundColor: Colors.info}]} />
    </View>
  )
};


const RootLayout = () => {

  return (
    <SQLiteProvider databaseName="acerola.db" onInit={dbMigrate}>
      <GestureHandlerRootView style={styles.container}>
        <Stack>
          <Stack.Screen name='index' options={{headerShown: false}} />              
          <Stack.Screen name='(pages)/HomePage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/SafeModeHomePage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/CreateNotePage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ManhwaPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ManhwaSearch' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ScansPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/DownloadPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ChapterPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/GenresPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/CollectionsPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/CollectionPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ManhwaByGenre' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ManhwaByAuthor' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ReadingHistoryPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/LatestUpdatesPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/MostPopularPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/BugReportPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/LibraryPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/DonatePage' options={{headerShown: false}} />              
          <Stack.Screen name='(pages)/RequestManhwaPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/ReleasesPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/EulaDisclaimerPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/NewsPage' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/Settings' options={{headerShown: false}} />
          <Stack.Screen name='(pages)/DebugPage' options={{headerShown: false}} />
        </Stack>
        <StatusBar hidden={true} barStyle={'light-content'} />
        <Toast
          position={AppConstants.UI.TOAST.POSITION as any}
          config={TOAST_CONFIG as any} 
          bottomOffset={AppConstants.UI.TOAST.BOTTOM_OFFSET} 
          visibilityTime={AppConstants.UI.TOAST.VISIBILITY_TIME}
          avoidKeyboard={true}
          swipeable={true}/>
      </GestureHandlerRootView>
    </SQLiteProvider>
  )
}

export default RootLayout


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: Colors.backgroundColor
  },
  toast: {
    width: AppConstants.UI.TOAST.WIDTH,
    height: AppConstants.UI.TOAST.HEIGHT,
    maxWidth: 500,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: wp(3),
    paddingRight: wp(2),
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.backgroundSecondary
  },
  leftBar: {
    position: 'absolute', 
    left: 0, 
    top: 0, 
    width: wp(1),
    height: '100%', 
    borderTopLeftRadius: AppConstants.UI.BORDER_RADIUS, 
    borderBottomLeftRadius: AppConstants.UI.BORDER_RADIUS
  }
})

