import { spFetchChapterList, spUpdateManhwaRating, spUpdateManhwaViews } from '@/lib/supabase';
import { formatNumberWithSuffix, formatTimestamp, hp, sleep } from '../../helpers/util';
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaIdComponent from '@/components/ManhwaIdComponent';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaImageCover from '@/components/ManhwaImageCover';
import ManhwaSummary from '@/components/util/ManhwaSummary';
import ManhwaAlternativeNames from '@/components/AltNames';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import { router, useLocalSearchParams } from 'expo-router';
import HomeButton from '@/components/buttons/HomeButton';
import { AppConstants } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import { ToastMessages } from '@/constants/Messages';
import { Typography } from '@/constants/typography';
import AddToLibrary from '@/components/AddToLibray';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import Footer from '@/components/util/Footer';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import Row from '@/components/util/Row';
import { Manhwa, ManhwaRating } from '@/helpers/types';
import React, { 
  memo, 
  useEffect, 
  useState, 
  useRef, 
  useCallback 
} from 'react';
import { 
  dbGetManhwaAltNames, 
  dbGetUserUUID, 
  dbReadManhwaById, 
  dbReadManhwaRating, 
  dbUpdateManhwaViews, 
  dbUpdateUserRating
} from '@/lib/database';
import { 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { useChapterState } from '@/store/chapterState';
import DownloadManhwaButton from '@/components/buttons/DownloadManhwaButton';
import Rating from '@/components/Rating';



interface ItemProps {
  text: string;
  backgroundColor: string;
}


const Item = memo(({ text, backgroundColor }: ItemProps) => (
  <View style={[styles.item, { backgroundColor }]}>
    <Text style={[Typography.regular, { color: Colors.backgroundColor }]}>{text}</Text>
  </View>
));



const ManhwaPage = () => {
  const db = useSQLiteContext();
  const params = useLocalSearchParams();
  const manhwa_id: number = params.manhwa_id as any;

  const [rating, setRating] = useState<ManhwaRating>({
    manhwa_id: 0, 
    rating: 0, 
    user_rating: 0, 
    total_rating: 0
  })
  const [loading, setLoading] = useState(false);
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [altNames, setAltNames] = useState<string[]>([]);
  const chapters = useChapterState((s) => s.chapters)
  const setChapters = useChapterState((s) => s.setChapters);
  const [ratingEnabled, setRatingEnabled] = useState(true)
  
  const isCancelled = useRef(false);
  const userId = useRef<string | null>(null)

  const handleChange = useCallback(async (value: number) => {
    if (value == rating.user_rating) { return }
    setRatingEnabled(false)
    sleep(0.2)
    if (userId.current === null) { userId.current = await dbGetUserUUID(db) }
    setRating(prev => ({ ...prev, user_rating: value })) 
    dbUpdateUserRating(db, manhwa_id, value)
    await spUpdateManhwaRating(manhwa_id, value * 10.0, userId.current)
    setRatingEnabled(true)
  }, [db, manhwa_id])

  const init = useCallback(async () => {
    if (!manhwa_id) {
      Toast.show(ToastMessages.EN.INVALID_MANHWA);
      router.replace("/(pages)/HomePage");
      return;
    }

    setLoading(true);

    try {
      const [, m, r, a] = await Promise.all([
        dbUpdateManhwaViews(db, manhwa_id),
        dbReadManhwaById(db, manhwa_id),
        dbReadManhwaRating(db, manhwa_id),
        dbGetManhwaAltNames(db, manhwa_id),
      ])

      if (!m) {
        Toast.show(ToastMessages.EN.INVALID_MANHWA)
        router.back()
        return
      }
      
      setManhwa(m)
      setRating(r)
      setAltNames(a.filter(n => n != m.title))
      if (isCancelled.current) return;

      const [, chapters] = await Promise.all([
        spUpdateManhwaViews(manhwa_id),
        spFetchChapterList(manhwa_id)
      ]);

      if (!isCancelled.current) {
        setChapters(chapters)        
      }
    } finally {
      if (!isCancelled.current) setLoading(false);
    }
  }, [db, manhwa_id]);

  useEffect(() => {
    isCancelled.current = false;
    init();
    return () => { isCancelled.current = true; };
  }, [init]);

  if (!manhwa) {
    return (
      <SafeAreaView style={AppStyle.safeArea}>
        <PageActivityIndicator />
      </SafeAreaView>
    );
  }  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
        <LinearGradient colors={[manhwa.color, Colors.backgroundColor]} style={styles.linearBackground} />
        <View style={{flex: 1, gap: AppConstants.UI.MARGIN, paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL}} >
          <Row style={styles.topBar}>
            <HomeButton />            
            <Row style={{ gap: AppConstants.UI.ICON.SIZE }}>
              <DownloadManhwaButton manhwa_name={manhwa.title} chapters={chapters} />
              <RandomManhwaButton color={Colors.backgroundColor} />
              <ReturnButton color={Colors.backgroundColor} />
            </Row>
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

          <Row style={{ gap: AppConstants.UI.MARGIN }}>
            <Item text={manhwa.status} backgroundColor={manhwa.color} />
            <Item text={`Views: ${formatNumberWithSuffix(manhwa.views + 1)}`} backgroundColor={manhwa.color} />
          </Row>

          {
            loading ?
            <ActivityIndicator size={AppConstants.UI.ICON.SIZE} color={manhwa.color} /> :
            <ManhwaChapterGrid manhwa={manhwa} />
          }          
        </View>
        <Footer/>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManhwaPage;

const styles = StyleSheet.create({
  container: {
    ...AppStyle.safeArea,
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
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    paddingBottom: AppConstants.UI.GAP,
  },
  padding: {
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL,
  },
});
