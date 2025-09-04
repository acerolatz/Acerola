import React, { useRef } from "react";
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AppConstants } from "@/constants/AppConstants";
import { Colors } from "@/constants/Colors";
import { AppStyle } from "@/styles/AppStyle";
import { useHomePageData } from "@/hooks/useHomePageData";
import Row from "@/app/components/util/Row";
import Column from "@/app/components/util/Column";
import Footer from "@/app/components/util/Footer";
import AppLogo from "@/app/components/util/Logo";
import GenreGrid from "@/app/components/grid/GenreGrid";
import CollectionGrid from "@/app/components/grid/CollectionsGrid";
import ContinueReadingGrid from "@/app/components/grid/ContinueReadingGrid";
import Top10Grid from "@/app/components/grid/Top10Grid";
import LatestUpdatesGrid from "@/app/components/grid/LatestUpdatesGrid";
import MostPopularGrid from "@/app/components/grid/MostPopularGrid";
import RandomCardsGrid from "@/app/components/grid/RandomCardsGrid";
import UpdateDatabaseButton from "@/app/components/buttons/UpdateDatabaseButton";
import RandomManhwaButton from "@/app/components/buttons/OpenRandomManhwaButton";
import Button from "@/app/components/buttons/Button";
import LateralMenu from "@/app/components/LateralMenu";
import DonationBottomSheet from "@/app/components/bottomsheet/DonationBottomSheet";
import NewAppReleaseBottomSheet from "@/app/components/bottomsheet/NewAppReleaseBottomSheet";
import { hp } from "@/helpers/util";


const HomePage = () => {
  const {
    genres,
    latestUpdates,
    mostViewed,
    readingHistory,
    top10manhwas,
    collections,    
    reloadCards,
    reloadTop10,
    loading,
  } = useHomePageData();

  // Lateral Menu animations
  const menuAnim = useRef(new Animated.Value(-AppConstants.UI.MENU.WIDTH)).current;
  const backgroundAnim = useRef(new Animated.Value(-AppConstants.UI.SCREEN.WIDTH)).current;
  const menuVisible = useRef(false);

  const openMenu = () => {
    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: AppConstants.UI.ANIMATION_TIME,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: AppConstants.UI.ANIMATION_TIME * 1.2,
        useNativeDriver: true,
      }),
    ]).start(() => (menuVisible.current = true));
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue: -AppConstants.UI.MENU.WIDTH,
        duration: AppConstants.UI.ANIMATION_TIME,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: -AppConstants.UI.SCREEN.WIDTH,
        duration: AppConstants.UI.ANIMATION_TIME,
        useNativeDriver: true,
      }),
    ]).start(() => (menuVisible.current = false));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Row style={styles.header}>
          <AppLogo />
          <Row style={{ gap: AppConstants.UI.ICON.SIZE }}>
            {!loading && (
              <>
                {AppConstants.APP.DEBUG.ENABLED && (
                  <Button iconName="bug-outline" onPress={() => router.navigate("/(pages)/DebugPage")} />
                )}
                <UpdateDatabaseButton />
                <Button iconName="search-outline" onPress={() => router.navigate("/(pages)/ManhwaSearch")} />
                <RandomManhwaButton />
              </>
            )}
            <Button iconName="options-outline" onPress={openMenu} />
          </Row>
        </Row>

        {/* GRIDS */}
        <Column style={AppStyle.gap}>
          <GenreGrid genres={genres} />
          <CollectionGrid collections={collections} />
          <ContinueReadingGrid manhwas={readingHistory} />
          <Top10Grid manhwas={top10manhwas} reloadTop10={reloadTop10} />
          <LatestUpdatesGrid manhwas={latestUpdates} />
          <MostPopularGrid manhwas={mostViewed} />
          {!loading && <RandomCardsGrid reloadCards={reloadCards} />}
          <Footer height={hp(4)} />
        </Column>
      </ScrollView>

      {/* Bottom Sheets */}
      <NewAppReleaseBottomSheet />
      <DonationBottomSheet />

      {/* Lateral Menu */}
      <Animated.View style={[styles.menuBackground, { transform: [{ translateX: backgroundAnim }] }]}>
        <Pressable onPress={closeMenu} style={styles.lateralMenuBackground} />
      </Animated.View>
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <LateralMenu closeMenu={closeMenu} />
      </Animated.View>
    </SafeAreaView>
  );
};


export default HomePage;


const styles = StyleSheet.create({
    safeArea: {
        ...AppStyle.safeArea,
        paddingTop: 0
    },
    lateralMenuBackground: {
        width: "100%",
        height: "100%",
    },
    header: {
        width: "100%",
        justifyContent: "space-between",
        paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
        paddingBottom: AppConstants.UI.GAP * 2,
    },
    sideMenu: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: Colors.backgroundColor,
        width: AppConstants.UI.MENU.WIDTH,
        elevation: 5,
        zIndex: 100,
    },
    menuBackground: {
        width: AppConstants.UI.SCREEN.WIDTH,
        position: "absolute",
        height: AppConstants.UI.SCREEN.HEIGHT * 1.2,
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        elevation: 4,
        zIndex: 90,
    },
});
