import PageActivityIndicator from '@/app/components/util/PageActivityIndicator';
import ManhwaIdComponent from '@/app/components/ManhwaIdComponent';
import ReturnButton from '@/app/components/buttons/ReturnButton';
import ManhwaAuthorInfo from '@/app/components/ManhwaAuthorInfo';
import ManhwaImageCover from '@/app/components/ManhwaImageCover';
import ManhwaSummary from '@/app/components/util/ManhwaSummary';
import ManhwaAlternativeNames from '@/app/components/AltNames';
import ManhwaGenreInfo from '@/app/components/ManhwaGenreInfo';
import HomeButton from '@/app/components/buttons/HomeButton';
import { router, useLocalSearchParams } from 'expo-router';
import AddToLibrary from '@/app/components/AddToLibray';
import { AppConstants } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import { ToastMessages } from '@/constants/Messages';
import { Typography } from '@/constants/typography';
import { formatTimestamp, hp } from '@/helpers/util';
import Footer from '@/app/components/util/Footer';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import Row from '@/app/components/util/Row';
import { Manhwa } from '@/helpers/types';
import React, { 
  useEffect, 
  useState, 
  useRef, 
  useCallback 
} from 'react';
import { 
  dbGetManhwaAltNames,  
  dbReadManhwaById  
} from '@/lib/database';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';



const DownloadedManhwaPage = () => {
  const db = useSQLiteContext();
  const params = useLocalSearchParams();
  const manhwa_id: number = params.manhwa_id as any;
  
  const [loading, setLoading] = useState(false);
  const [manhwa, setManhwa] = useState<Manhwa | null>(null);
  const [altNames, setAltNames] = useState<string[]>([]);
  
  const isCancelled = useRef(false);

  const init = useCallback(async () => {
    if (!manhwa_id) {
      Toast.show(ToastMessages.EN.INVALID_MANHWA);
      router.replace("/(pages)/HomePage");
      return;
    }

    setLoading(true);

    try {
      const [m, a] = await Promise.all([
        dbReadManhwaById(db, manhwa_id),
        dbGetManhwaAltNames(db, manhwa_id)
      ])

      if (!m) {
        Toast.show(ToastMessages.EN.INVALID_MANHWA)
        router.back()
        return
      }

      setManhwa(m)
      setAltNames(a.filter(n => n != m.title))
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
    height: hp(92)
  },  
  topBar: {
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    paddingBottom: AppConstants.UI.GAP,
  }  
});
