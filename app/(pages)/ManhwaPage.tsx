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
import { formatTimestamp, hp, wp } from '@/helpers/util';
import { dbGetManhwaAltNames, dbReadManhwaById, dbUpdateManhwaViews } from '@/lib/database';
import { spUpdateManhwaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
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
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { formatNumberWithSuffix } from '../../helpers/util';
import Row from '@/components/util/Row';
import ManhwaIdComponent from '@/components/ManhwaIdComponent';
import Footer from '@/components/util/Footer';
import { AppConstants } from '@/constants/AppConstants';


interface ItemProps {
  text: string
  backgroundColor: string
  textColor?: string
}

const Item = ({text, backgroundColor, textColor = Colors.backgroundColor}: ItemProps) => {
  return (
    <View style={[styles.item, {backgroundColor}]} >
      <Text style={[AppStyle.textRegular, {color: textColor}]}>{text}</Text>
    </View>
  )
}


const ManhwaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manhwa_id: number = params.manhwa_id as any
  const [manhwa, setManhwa] = useState<Manhwa | null>(null)
  const [altNames, setAltNames] = useState<string[]>([])

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
        <LinearGradient colors={[manhwa.color, Colors.backgroundColor]} style={styles.linearBackground} />

        {/* Top */}
        <Row style={styles.topBar} >
            <HomeButton color={Colors.backgroundColor} iconName='home-outline' backgroundColor='transparent' />
            <Row style={{gap: 20}} >
              <BugReportButton color={Colors.backgroundColor} title={manhwa.title} backgroundColor='transparent' /> 
              <RandomManhwaButton color={Colors.backgroundColor} backgroundColor='transparent' />
              <ReturnButton color={Colors.backgroundColor} backgroundColor='transparent' />
            </Row>
        </Row>
        
        <View style={styles.manhwaContainer}>

          {/* Manhwa Image */}
          <View style={{width: '100%'}} >
            <Image
              source={manhwa.cover_image_url}
              contentFit='cover'
              style={styles.image} />
            <ManhwaIdComponent manhwa_id={manhwa.manhwa_id} />
          </View>

          {/* Title, Summary and Last Update */}
          <View style={{alignSelf: "flex-start", gap: 10, marginBottom: 10}} >
            <Text style={AppStyle.textMangaTitle}>{manhwa!.title}</Text>
            <ManhwaAlternativeNames names={altNames} />
            <Text style={AppStyle.textRegular}>{manhwa.descr}</Text>
            <Text style={[AppStyle.textRegular, {alignSelf: "flex-start"}]}>Last update: {formatTimestamp(manhwa.updated_at)}</Text>
          </View>
          
          {/* Genre and Authors Info */}
          <ManhwaAuthorInfo manhwa={manhwa} />
          <ManhwaGenreInfo manhwa={manhwa} />

          <AddToLibray 
            manhwa={manhwa} 
            textColor={Colors.backgroundColor} 
            backgroundColor={manhwa.color} />

          {/* Status (OnGoing or Completed) and Num Views */}
          <Row style={{gap: AppConstants.COMMON.MARGIN}} >
            <Item text={manhwa.status} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
            <Item text={`Views: ${formatNumberWithSuffix(manhwa.views + 1)}`} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
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
    width: wp(100),
    left: 0,    
    top: 0,
    height: hp(100)
  },
  item: {
    height: 52,
    borderRadius: AppConstants.COMMON.BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',
    justifyContent: "space-between", 
    marginTop: 10,
    paddingHorizontal: wp(4),
    paddingVertical: hp(4),
    paddingBottom: 10
  },
  manhwaContainer: {
    width: '100%', 
    gap: AppConstants.COMMON.MARGIN, 
    alignItems: "center", 
    paddingHorizontal: wp(4)    
  },
  image: {
    width: '100%',
    maxWidth: wp(92),
    height: 520, 
    borderRadius: AppConstants.COMMON.BORDER_RADIUS
  },
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.gray
  }
})
