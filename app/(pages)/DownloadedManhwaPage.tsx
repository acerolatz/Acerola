import { 
  asyncPool, 
  formatTimestamp, 
  getRelativeHeight, 
  hasInternetAvailable, 
  sleep 
} from '@/helpers/util';
import PageActivityIndicator from '@/app/components/util/PageActivityIndicator';
import ManhwaIdComponent from '@/app/components/ManhwaIdComponent';
import ReturnButton from '@/app/components/buttons/ReturnButton';
import ManhwaImageCover from '@/app/components/ManhwaImageCover';
import { Chapter, Manhwa, ManhwaRating } from '@/helpers/types';
import HomeButton from '@/app/components/buttons/HomeButton';
import { router, useLocalSearchParams } from 'expo-router';
import { AppConstants } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import { ToastMessages } from '@/constants/Messages';
import { Typography } from '@/constants/typography';
import Footer from '@/app/components/util/Footer';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import Row from '@/app/components/util/Row';
import React, { 
  useEffect, 
  useState, 
  useRef, 
  useCallback 
} from 'react';
import { 
  dbReadManhwaAltNames,
  dbGetUserUUID,
  dbReadCompletedDownloadsByManhwa,  
  dbReadManhwaById,  
  dbReadManhwaRating,  
  dbUpdateManhwaViews,  
  dbUpdateUserRating
} from '@/lib/database';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import DownloadedChapterGrid from '../components/grid/DownloadedChapterGrid';
import { spFetchChapterList, spUpdateManhwaRating } from '@/lib/supabase';
import ManhwaAuthorInfo from '../components/ManhwaAuthorInfo';
import ManhwaSummary from '../components/util/ManhwaSummary';
import ManhwaAlternativeNames from '../components/AltNames';
import ManhwaGenreInfo from '../components/ManhwaGenreInfo';
import { downloadManager } from '@/helpers/DownloadManager';
import TextButton from '../components/buttons/TextButton';
import { useChapterState } from '@/hooks/chapterState';
import AddToLibrary from '../components/AddToLibray';
import Rating from '../components/Rating';
import ActivityButtonIndicator from '../components/buttons/ActivityButtonIndicator';


const DownloadedManhwaPage = () => {
  const db = useSQLiteContext();
  const params = useLocalSearchParams();
  const manhwa_id: number = params.manhwa_id as any;

  const chapters = useChapterState((s) => s.chapters)
  const setChapters = useChapterState((s) => s.setChapters);
  const [rating, setRating] = useState<ManhwaRating>({
    manhwa_id: 0, 
    rating: 0, 
    user_rating: 0, 
    total_rating: 0
  })
  const [loading, setLoading] = useState(false);
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [altNames, setAltNames] = useState<string[]>([]);
  const [ratingEnabled, setRatingEnabled] = useState(true)
  const [loadingDownloads, setLoadingDownloads] = useState(false)
  
  const userId = useRef<string | null>(null)
  const isCancelled = useRef(false);

  const handleChange = async (value: number) => {
    if (value == rating.user_rating) { return }
    setRatingEnabled(false)
      await sleep(0.2)
      if (userId.current === null) { userId.current = await dbGetUserUUID(db) }
      setRating(prev => ({ ...prev, user_rating: value })) 
      dbUpdateUserRating(db, manhwa_id, value)
      if (await hasInternetAvailable()) {
        await spUpdateManhwaRating(manhwa_id, value * 10.0, userId.current)
      }
    setRatingEnabled(true)
  }

  const init = useCallback(async () => {
    if (!manhwa_id) {
      Toast.show(ToastMessages.EN.INVALID_MANHWA);
      router.replace("/(pages)/HomePage");
      return;
    }

    setLoading(true);

    try {
      const [, d, m, r, a] = await Promise.all([
        dbUpdateManhwaViews(db, manhwa_id),
        dbReadCompletedDownloadsByManhwa(db, manhwa_id),
        dbReadManhwaById(db, manhwa_id),
        dbReadManhwaRating(db, manhwa_id),
        dbReadManhwaAltNames(db, manhwa_id)
      ])

      if (!m) {
        Toast.show(ToastMessages.EN.INVALID_MANHWA)
        router.back()
        return
      }

      setManhwa(m)
      setRating(r)
      setAltNames(a.filter(n => n != m.title))
      setChapters(d)
    } finally {

      if (!isCancelled.current) setLoading(false);
    }
  }, [db, manhwa_id]);

  useEffect(() => {
    isCancelled.current = false;
    init();
    return () => { isCancelled.current = true; };
  }, [init]);

  const downloadAll = async () => {
    if (!manhwa) { return }
    if (!(await hasInternetAvailable())) {
      Toast.show(ToastMessages.EN.NO_INTERNET)
      return 
    }
    setLoadingDownloads(true)
    const c: Chapter[] = await spFetchChapterList(manhwa.manhwa_id)
    if (c.length <= chapters.length) {
      Toast.show({text1: "All chapters already downloaded!", type: "info", visibilityTime: 3000})
      setLoadingDownloads(false)
      return
    }
    await asyncPool<Chapter, void>(
      8,
      c, 
      async (chapter: Chapter) => await downloadManager.addToQueue(db, {
        manhwa_name: manhwa.title,
        manhwa_id,
        chapter_id: chapter.chapter_id,
        chapter_name: chapter.chapter_name
      }, 
      false)
    )
    Toast.show({text1: "Download started!", type: "info"})
    setLoadingDownloads(false)
  }

  if (loading || !manhwa) {
    return (
      <SafeAreaView style={AppStyle.safeArea}>
        <PageActivityIndicator />
      </SafeAreaView>
    );
  }  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false} >
        <LinearGradient colors={[manhwa.color, Colors.backgroundColor]} style={styles.linearBackground} />
        <View style={styles.container} >
          <Row style={styles.topBar}>
            <HomeButton />
            <ReturnButton color={Colors.backgroundColor} />
          </Row>

          <View>
            <ManhwaImageCover url={manhwa.cover_image_url} />
            <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} />
          </View>

          <Text style={Typography.semiboldXl}>{manhwa.title}</Text>
          <Rating
            value={rating.user_rating != 0 ? rating.user_rating : rating.rating / 10.0}
            setValue={handleChange} 
            color={manhwa.color}
            readOnly={!ratingEnabled} />
          <ManhwaAlternativeNames names={altNames} />
          <Text style={Typography.light}>last update: {formatTimestamp(manhwa.updated_at)}</Text>
          
          <ManhwaSummary summary={manhwa.descr} />
          <ManhwaAuthorInfo manhwa={manhwa} />
          <ManhwaGenreInfo manhwa={manhwa} />

          <AddToLibrary manhwa={manhwa} backgroundColor={manhwa.color} />

          <Row style={AppStyle.margin} > 
            <TextButton text='Edit' backgroundColor={manhwa.color} />
            {
              loadingDownloads ?
              <ActivityButtonIndicator  backgroundColor={manhwa.color} /> :
              <TextButton text='Download All' backgroundColor={manhwa.color} onPress={downloadAll}  />
            }
          </Row>          

          <DownloadedChapterGrid manhwa={manhwa} />
        </View>
        <Footer/>
      </ScrollView>
    </SafeAreaView>
  );
};


export default DownloadedManhwaPage;


const styles = StyleSheet.create({
  safeArea: {
    ...AppStyle.safeArea,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
  },
  container: {
    flex: 1, 
    gap: AppConstants.UI.MARGIN, 
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL
  },
  linearBackground: {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: 0,
    height: getRelativeHeight(720, 980, AppConstants.UI.SCREEN.VALID_WIDTH)
  },  
  topBar: {
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    paddingBottom: AppConstants.UI.GAP,
  }  
});
