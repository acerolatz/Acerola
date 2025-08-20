import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import BugReportButton from '@/components/buttons/BugReportButton';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaIdComponent from '@/components/ManhwaIdComponent';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaImageCover from '@/components/ManhwaImageCover';
import { formatNumberWithSuffix } from '../../helpers/util';
import ManhwaSummary from '@/components/util/ManhwaSummary';
import ManhwaAlternativeNames from '@/components/AltNames';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import { router, useLocalSearchParams } from 'expo-router';
import HomeButton from '@/components/buttons/HomeButton';
import { AppConstants } from '@/constants/AppConstants';
import { useResponsive } from '@/helpers/useResponsive';
import { LinearGradient } from 'expo-linear-gradient';
import { ToastMessages } from '@/constants/Messages';
import { spUpdateManhwaViews } from '@/lib/supabase';
import { Typography } from '@/constants/typography';
import AddToLibray from '@/components/AddToLibray';
import { formatTimestamp } from '@/helpers/util';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';
import Footer from '@/components/util/Footer';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import Row from '@/components/util/Row';
import { Manhwa } from '@/helpers/types';
import { 
  dbGetManhwaAltNames, 
  dbReadManhwaById, 
  dbUpdateManhwaViews 
} from '@/lib/database';
import React, {
  memo,
    useEffect,
    useMemo,
    useState
} from 'react';
import {  
  FlatList,
  SafeAreaView,  
  StyleSheet,
  Text,
  View  
} from 'react-native';


interface ItemProps {
  text: string
  backgroundColor: string
}


const Item = memo(({ text, backgroundColor }: ItemProps) => (
  <View style={{ ...styles.item, backgroundColor }}>
    <Text style={{ ...Typography.regular, color: Colors.backgroundColor }}>{text}</Text>
  </View>
));


const ManhwaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manhwa_id: number = params.manhwa_id as any
  const [manhwa, setManhwa] = useState<Manhwa | null>(null)
  const [altNames, setAltNames] = useState<string[]>([])

  const { hp } = useResponsive()  

  useEffect(
    () => {
      let isCancelled = false
      async function init() {
        if (!manhwa_id) { 
          Toast.show(ToastMessages.EN.INVALID_MANHWA)
          router.replace("/(pages)/HomePage")
          return
        }        
        
        const m = await dbReadManhwaById(db, manhwa_id)
        if (!m) {
          Toast.show(ToastMessages.EN.INVALID_MANHWA)
          router.back()
          return
        }

        if (isCancelled) { return }
        setManhwa(m)
        
        await dbUpdateManhwaViews(db, manhwa_id)
        const names = await dbGetManhwaAltNames(db, manhwa_id, m.title)

        if (isCancelled) { return }
        setAltNames(names)

        if (isCancelled) { return }
        await spUpdateManhwaViews(manhwa_id)
      }

      init()
      return () => { isCancelled = true }
    },
    [db, manhwa_id]
  )  
  
  const sections = useMemo(() => {
    return [
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
      { key: 'footer' }
    ];
  }, []);

  const renderItem = ({ item }: { item: { key: string } }) => {
    switch (item.key) {
      case 'linearBackground':
        return (
          <LinearGradient 
            colors={[manhwa!.color, Colors.backgroundColor]} 
            style={{...styles.linearBackground, height: hp(92)}} />
        )        
      case 'topBar':
        return (
          <Row style={styles.topBar}>
            <HomeButton />
            <Row style={{ gap: AppConstants.ICON.SIZE }}>
              <BugReportButton title={manhwa!.title} color={Colors.backgroundColor} />
              <RandomManhwaButton color={Colors.backgroundColor} />
              <ReturnButton color={Colors.backgroundColor} />
            </Row>
          </Row>
        );
      case 'image':
        return (
          <View style={styles.padding} >
            <ManhwaImageCover url={manhwa!.cover_image_url} />
            <ManhwaIdComponent manhwa_id={manhwa!.manhwa_id} />
          </View>
        );
      case 'title':
        return (
          <View style={styles.padding} >
            <Text style={Typography.semiboldXl}>{manhwa!.title}</Text>
            <Text style={Typography.light}>last update: {formatTimestamp(manhwa!.updated_at)}</Text>
            <ManhwaAlternativeNames names={altNames} />
            <ManhwaSummary summary={manhwa!.descr} />
          </View>
        );
      case 'authors':
        return (
          <View style={styles.padding} >
            <ManhwaAuthorInfo manhwa={manhwa!} />
          </View>
        )
      case 'genres':
        return (
          <View style={styles.padding} >
            <ManhwaGenreInfo manhwa={manhwa!} />
          </View>
        )
      case 'library':
        return (
          <View style={styles.padding} >
            <AddToLibray manhwa={manhwa!} backgroundColor={manhwa!.color} />
          </View>
        )        
      case 'statusViews':
        return (
          <Row style={{ gap: AppConstants.MARGIN, paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL }}>
            <Item text={manhwa!.status} backgroundColor={manhwa!.color} />
            <Item text={`Views: ${formatNumberWithSuffix(manhwa!.views + 1)}`} backgroundColor={manhwa!.color} />
          </Row>
        );
      case 'chapters':
        return (
          <View style={styles.padding} >
            <ManhwaChapterGrid manhwa={manhwa!} />
          </View>
        )
      case 'footer':
        return <Footer />;
      default:
        return null;
    }
  };

  if (!manhwa) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <PageActivityIndicator/>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        ItemSeparatorComponent={() => <View style={{height: AppConstants.MARGIN}} />}
        renderItem={renderItem}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />        
    </SafeAreaView>
  )
}

export default ManhwaPage

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, 
    paddingVertical: 0,
    paddingTop: 0
  },
  linearBackground: {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: 0
  },
  item: {
    height: AppConstants.BUTTON.SIZE,
    borderRadius: AppConstants.BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',
    justifyContent: "space-between",
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL,
    paddingTop: AppConstants.SCREEN.PADDING_VERTICAL,
    paddingBottom: AppConstants.GAP    
  },
  manhwaContainer: {
    width: '100%',
    gap: AppConstants.MARGIN,
    alignItems: "flex-start",
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL
  },
  padding: {
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL
  }
})
