import AddToLibray from '@/components/AddToLibray';
import ManhwaAlternativeNames from '@/components/AltNames';
import BugReportButton from '@/components/buttons/BugReportButton';
import HomeButton from '@/components/buttons/HomeButton';
import RandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { Manhwa } from '@/helpers/types';
import { formatTimestamp } from '@/helpers/util';
import { 
  dbGetManhwaAltNames, 
  dbReadManhwaById, 
  dbUpdateManhwaViews 
} from '@/lib/database';
import { spUpdateManhwaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, {
    useEffect,
    useState
} from 'react';
import {  
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import Toast from 'react-native-toast-message';
import { formatNumberWithSuffix } from '../../helpers/util';
import Row from '@/components/util/Row';
import ManhwaIdComponent from '@/components/ManhwaIdComponent';
import Footer from '@/components/util/Footer';
import { AppConstants } from '@/constants/AppConstants';
import ManhwaImageCover from '@/components/ManhwaImageCover';
import { Typography } from '@/constants/typography';
import ManhwaSummary from '@/components/util/ManhwaSummary';
import { useResponsive } from '@/helpers/useResponsive';


interface ItemProps {
  text: string
  backgroundColor: string  
}

const Item = ({text, backgroundColor}: ItemProps) => {
  return (
    <View style={{...styles.item, backgroundColor}} >
      <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{text}</Text>
    </View>
  )
}


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

  if (!manhwa) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <PageActivityIndicator/>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >

        <LinearGradient 
          colors={[manhwa.color, Colors.backgroundColor]} 
          style={{...styles.linearBackground, height: hp(100)}} />

        {/* Top */}        
        <Row style={styles.topBar} >
          <HomeButton color={Colors.backgroundColor} iconName='home-outline'/>
          <Row style={{gap: AppConstants.ICON.SIZE}} >
            <BugReportButton title={manhwa.title} color={Colors.backgroundColor} /> 
            <RandomManhwaButton color={Colors.backgroundColor} />
            <ReturnButton color={Colors.backgroundColor} />
          </Row>
        </Row>

        {/* Main Content */}
        <View style={styles.manhwaContainer}>
          
          {/* Manhwa Image */}
          <View>
            <ManhwaImageCover url={manhwa.cover_image_url} />
            <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} />
          </View>

          {/* Title, Summary and Last Update */}          
          <Text style={Typography.semiboldXl}>{manhwa!.title}</Text>
          <ManhwaAlternativeNames names={altNames} />
          <ManhwaSummary summary={manhwa.descr} />
          <Text style={Typography.regular}>last update: {formatTimestamp(manhwa.updated_at)}</Text>
          
          {/* Genre and Authors Info */}
          <ManhwaAuthorInfo manhwa={manhwa} />
          <ManhwaGenreInfo manhwa={manhwa} />

          {/* Libray */}
          <AddToLibray manhwa={manhwa} backgroundColor={manhwa.color} />

          {/* Status (OnGoing or Completed) and Num Views */}
          <Row style={{gap: AppConstants.COMMON.MARGIN}} >
            <Item text={manhwa.status} backgroundColor={manhwa.color} />
            <Item text={`Views: ${formatNumberWithSuffix(manhwa.views + 1)}`} backgroundColor={manhwa.color} />
          </Row>
          
          {/* Chapter Grid */}
          <ManhwaChapterGrid manhwa={manhwa} />

          <Footer/>
        </View>

      </ScrollView>
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
    borderRadius: AppConstants.COMMON.BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',
    justifyContent: "space-between",
    paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL,
    paddingVertical: AppConstants.COMMON.SCREEN_PADDING_VERTICAL,
    paddingBottom: 20
  },
  manhwaContainer: {
    width: '100%',
    gap: AppConstants.COMMON.MARGIN,
    alignItems: "flex-start",
    paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL
  },
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.gray
  }
})
