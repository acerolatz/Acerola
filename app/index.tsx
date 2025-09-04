import PageActivityIndicator from '@/app/components/util/PageActivityIndicator';
import { useAppInit } from '@/hooks/useAppInit';
import { AppStyle } from '@/styles/AppStyle';
import { SafeAreaView } from 'react-native';
import {
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    useFonts,
} from '@expo-google-fonts/league-spartan';
import React from 'react';


const App = () => {
  const { isInitializing } = useAppInit();

  const [fontsLoaded] = useFonts({
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
  });

  if (isInitializing || !fontsLoaded) {
    return (
      <SafeAreaView style={AppStyle.safeArea}>
        <PageActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <PageActivityIndicator />
    </SafeAreaView>
  );
};

export default App;
