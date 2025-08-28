import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaIdComponent from '@/components/ManhwaIdComponent';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaImageCover from '@/components/ManhwaImageCover';
import { formatNumberWithSuffix, formatTimestamp, hp } from '../../helpers/util';
import ManhwaSummary from '@/components/util/ManhwaSummary';
import ManhwaAlternativeNames from '@/components/AltNames';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import { router, useLocalSearchParams } from 'expo-router';
import HomeButton from '@/components/buttons/HomeButton';
import { AppConstants } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import { ToastMessages } from '@/constants/Messages';
import { spFetchChapterList, spUpdateManhwaViews } from '@/lib/supabase';
import { Typography } from '@/constants/typography';
import AddToLibrary from '@/components/AddToLibray';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import Footer from '@/components/util/Footer';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import Row from '@/components/util/Row';
import { Manhwa } from '@/helpers/types';
import { dbGetManhwaAltNames, dbReadManhwaById, dbUpdateManhwaViews } from '@/lib/database';
import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useChapterState } from '@/store/chapterState';


interface ItemProps {
  text: string;
  backgroundColor: string;
}


const Item = memo(({ text, backgroundColor }: ItemProps) => (
  <View style={[styles.item, { backgroundColor }]}>
    <Text style={[Typography.regular, { color: Colors.backgroundColor }]}>{text}</Text>
  </View>
));


const SECTIONS = Object.freeze([
  { key: 'linearBackground' },
  { key: 'topBar' },
  { key: 'image' },
  { key: 'title' },
  { key: 'summary' },
  { key: 'authors' },
  { key: 'genres' },
  { key: 'library' },
  { key: 'statusViews' },
  { key: 'chapters' },
  { key: 'footer' },
]);


const ManhwaPage = () => {
  const db = useSQLiteContext();
  const params = useLocalSearchParams();
  const manhwa_id: number = params.manhwa_id as any;

  const [loading, setLoading] = useState(false);
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [altNames, setAltNames] = useState<string[]>([]);
  const setChapters = useChapterState((s) => s.setChapters);

  const isCancelled = useRef(false);

  const init = useCallback(async () => {
    if (!manhwa_id) {
      Toast.show(ToastMessages.EN.INVALID_MANHWA);
      router.replace("/(pages)/HomePage");
      return;
    }

    setLoading(true);

    try {
      const m = await dbReadManhwaById(db, manhwa_id);
      if (!m) {
        Toast.show(ToastMessages.EN.INVALID_MANHWA);
        router.back();
        return;
      }
      
      setManhwa(m);
      if (isCancelled.current) return;

      const [, names, , chapters] = await Promise.all([
        dbUpdateManhwaViews(db, manhwa_id),
        dbGetManhwaAltNames(db, manhwa_id, m.title),
        spUpdateManhwaViews(manhwa_id),
        spFetchChapterList(manhwa_id),
      ]);

      if (!isCancelled.current) {
        setAltNames(names);
        setChapters(chapters);
      }
    } finally {
      if (!isCancelled.current) setLoading(false);
    }
  }, [db, manhwa_id, setChapters]);

  useEffect(() => {
    isCancelled.current = false;
    init();
    return () => {
      isCancelled.current = true;
    };
  }, [init]);

  const renderItem = useCallback(
    ({ item }: { item: { key: string } }) => {
      if (!manhwa) return null;

      switch (item.key) {
        case 'linearBackground':
          return <LinearGradient colors={[manhwa.color, Colors.backgroundColor]} style={styles.linearBackground} />;
        case 'topBar':
          return (
            <Row style={styles.topBar}>
              <HomeButton />
              <Row style={{ gap: AppConstants.UI.ICON.SIZE }}>
                <RandomManhwaButton color={Colors.backgroundColor} />
                <ReturnButton color={Colors.backgroundColor} />
              </Row>
            </Row>
          );
        case 'image':
          return (
            <View style={styles.padding}>
              <ManhwaImageCover url={manhwa.cover_image_url} />
              <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} />
            </View>
          );
        case 'title':
          return (
            <View style={styles.padding}>
              <Text style={Typography.semiboldXl}>{manhwa.title}</Text>
              <ManhwaAlternativeNames names={altNames} />
              <Text style={Typography.light}>last update: {formatTimestamp(manhwa.updated_at)}</Text>
              <ManhwaSummary summary={manhwa.descr} />
            </View>
          );
        case 'authors':
          return (
            <View style={styles.padding}>
              <ManhwaAuthorInfo manhwa={manhwa} />
            </View>
          );
        case 'genres':
          return (
            <View style={styles.padding}>
              <ManhwaGenreInfo manhwa={manhwa} />
            </View>
          );
        case 'library':
          return (
            <View style={styles.padding}>
              <AddToLibrary manhwa={manhwa} backgroundColor={manhwa.color} />
            </View>
          );
        case 'statusViews':
          return (
            <Row style={{ gap: AppConstants.UI.MARGIN, paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL }}>
              <Item text={manhwa.status} backgroundColor={manhwa.color} />
              <Item text={`Views: ${formatNumberWithSuffix(manhwa.views + 1)}`} backgroundColor={manhwa.color} />
            </Row>
          );
        case 'chapters':
          return loading ? (
            <ActivityIndicator size={AppConstants.UI.ICON.SIZE} color={manhwa.color} />
          ) : (
            <View style={styles.padding}>
              <ManhwaChapterGrid manhwa={manhwa} />
            </View>
          );
        case 'footer':
          return <Footer />;
        default:
          return null;
      }
    },
    [manhwa, altNames, loading]
  );

  if (!manhwa) {
    return (
      <SafeAreaView style={AppStyle.safeArea}>
        <PageActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]}>
      <FlatList
        data={SECTIONS}
        keyExtractor={(item) => item.key}
        ItemSeparatorComponent={() => <View style={{ height: AppConstants.UI.MARGIN }} />}
        renderItem={renderItem}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={3}
      />
    </SafeAreaView>
  );
};

export default ManhwaPage;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
  },
  linearBackground: {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: 0,
    height: hp(92)
  },
  item: {
    height: AppConstants.UI.BUTTON.SIZE,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  topBar: {
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL,
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    paddingBottom: AppConstants.UI.GAP,
  },
  padding: {
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL,
  },
});
