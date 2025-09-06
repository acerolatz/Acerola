import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppConstants } from '@/constants/AppConstants';
import { Typography } from '@/constants/typography';
import Toast from 'react-native-toast-message';
import { SQLiteProvider } from 'expo-sqlite';
import { Colors } from '@/constants/Colors';
import { dbMigrate } from '@/lib/database';
import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { wp } from '@/helpers/util';


const ToastMessage = ({ text1, text2, color, secondary }: {
  text1: string;
  text2?: string;
  color: string;
  secondary?: boolean;
}) => (
  <View style={[styles.toast, secondary && { backgroundColor: Colors.backgroundColor }]}>
    <Text numberOfLines={1} style={Typography.regular}>{text1}</Text>
    {text2 && <Text numberOfLines={1} style={Typography.regular}>{text2}</Text>}
    <View style={[styles.leftBar, { backgroundColor: color }]} />
  </View>
);


const RootLayout = () => {
  const TOAST_CONFIG = useMemo(() => ({
    success: (props: any) => <ToastMessage {...props} color={Colors.success} />,
    success1: (props: any) => <ToastMessage {...props} color={Colors.success} secondary />,
    error: (props: any) => <ToastMessage {...props} color={Colors.error} />,
    error1: (props: any) => <ToastMessage {...props} color={Colors.error} secondary />,
    info: (props: any) => <ToastMessage {...props} color={Colors.info} />,
    info1: (props: any) => <ToastMessage {...props} color={Colors.info} secondary />
  }), []);

  return (
    <SQLiteProvider databaseName="acerola.db" onInit={dbMigrate}>
      <GestureHandlerRootView style={styles.container}>
        <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: "fade" }}>          
          <Stack.Screen name="(pages)/HomePage" />
          <Stack.Screen name="(pages)/SafeModeHomePage" />
          
          <Stack.Screen name="(pages)/ManhwaPage" />
          <Stack.Screen name="(pages)/ChapterPage" />
          <Stack.Screen name="(pages)/DownloadedChapterPage" />
          <Stack.Screen name="(pages)/DownloadedManhwaPage" />
          <Stack.Screen name="(pages)/ManhwaSearch" />
          <Stack.Screen name="(pages)/ManhwaByGenre" />
          <Stack.Screen name="(pages)/ManhwaByAuthor" />
          
          <Stack.Screen name="(pages)/GenresPage" />
          <Stack.Screen name="(pages)/LibraryPage" />
          <Stack.Screen name="(pages)/CollectionsPage" />
          <Stack.Screen name="(pages)/CollectionPage" />
          <Stack.Screen name="(pages)/ScansPage" />
          
          <Stack.Screen name="(pages)/DownloadPage" />
          <Stack.Screen name="(pages)/ReadingHistoryPage" />
          <Stack.Screen name="(pages)/LatestUpdatesPage" />
          <Stack.Screen name="(pages)/MostPopularPage" />
          <Stack.Screen name="(pages)/ReleasesPage" />
          <Stack.Screen name="(pages)/NewsPage" />

          <Stack.Screen name="(pages)/CreateNotePage" />
          <Stack.Screen name="(pages)/UpdateNotePage" />
          <Stack.Screen name="(pages)/BugReportPage" />
          <Stack.Screen name="(pages)/RequestManhwaPage" />
          <Stack.Screen name="(pages)/DonatePage" />
          <Stack.Screen name="(pages)/EulaDisclaimerPage" />
          <Stack.Screen name="(pages)/Settings" />
          <Stack.Screen name="(pages)/DebugPage" />
        </Stack>

        <StatusBar hidden barStyle="light-content" />

        <Toast
          position={AppConstants.UI.TOAST.POSITION as any}
          config={TOAST_CONFIG}
          bottomOffset={AppConstants.UI.TOAST.BOTTOM_OFFSET}
          visibilityTime={AppConstants.UI.TOAST.VISIBILITY_TIME}
          avoidKeyboard
          swipeable
        />
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
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
    backgroundColor: Colors.backgroundSecondary,
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: wp(1),
    height: '100%',
    borderTopLeftRadius: AppConstants.UI.BORDER_RADIUS,
    borderBottomLeftRadius: AppConstants.UI.BORDER_RADIUS,
  },
});
