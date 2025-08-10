import AddToLibray from '@/components/AddToLibray';
import ManhwaAlternativeNames from '@/components/AltNames';
import BugReportButton from '@/components/buttons/BugReportButton';
import HomeButton from '@/components/buttons/HomeButton';
import OpenRandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import PageActivityIndicator from '@/components/util/PageActivityIndicator';
import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { DonateMethod, Manhwa } from '@/helpers/types';
import { formatTimestamp, hp, wp } from '@/helpers/util';
import { dbGetManhwaAltNames, dbReadManhwaById, dbUpdateManhwaViews } from '@/lib/database';
import { spGetDonationMethods, spUpdateManhwaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import {
  Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { formatNumberWithSuffix } from '../../helpers/util';
import DonateButton from '@/components/buttons/DonateButton';
import { useDonateState } from '@/store/donateState';
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator';
import { FlatList } from 'react-native';
import DonateComponent from '@/components/DonateComponent';
import Row from '@/components/util/Row';
import Ionicons from '@expo/vector-icons/Ionicons';


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
  const [loading, setLoading] = useState(false)
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
      <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
        <PageActivityIndicator/>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >

        {/* Header */}
        <LinearGradient 
            colors={[manhwa.color, Colors.backgroundColor]}
            style={styles.linearBackground} />

        <View style={styles.topBar} >
            <HomeButton color={Colors.backgroundColor} iconName='home-outline' size={22} backgroundColor='transparent' />
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 14}} >
              <BugReportButton color={Colors.backgroundColor} title={manhwa.title} size={22} backgroundColor='transparent' /> 
              <OpenRandomManhwaButton color={Colors.backgroundColor} size={22} backgroundColor='transparent' />
              <ReturnButton color={Colors.backgroundColor} size={22} backgroundColor='transparent' />
            </View>
        </View>

        {/* Manga Info */}
        <View style={styles.manhwaContainer}>
            <View style={{width: '100%'}} >
              <Image
                source={manhwa.cover_image_url}
                contentFit='cover'
                style={styles.image} />
              {
                AppConstants.COMMON.DEBUG_MODE &&
                <View style={{position: 'absolute', left: 6, top: 6, borderRadius: 4, width: 42, height: 42, backgroundColor: Colors.backgroundColor, alignItems: "center", justifyContent: "center"}} >
                    <Text style={AppStyle.textRegular}>{manhwa.manhwa_id}</Text>
                </View>
              }
            </View>
            <View style={{alignSelf: "flex-start", gap: 8}} >
              <Text style={AppStyle.textMangaTitle}>{manhwa!.title}</Text>
              <ManhwaAlternativeNames names={altNames} />
              <Text style={AppStyle.textRegular}>{manhwa.descr}</Text>
            </View>
            <Text style={[AppStyle.textRegular, {alignSelf: "flex-start"}]}>Last update: {formatTimestamp(manhwa.updated_at)}</Text>
            <ManhwaAuthorInfo manhwa={manhwa} />
            <ManhwaGenreInfo manhwa={manhwa} />
            <AddToLibray 
              manhwa={manhwa} 
              textColor={Colors.backgroundColor} 
              backgroundColor={manhwa.color} />

            <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
              <Item text={manhwa.status} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
              <Item text={`Views: ${formatNumberWithSuffix(manhwa.views + 1)}`} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
            </View>

            <ManhwaChapterGrid manhwa={manhwa} />
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
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',     
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginTop: 10,
    paddingHorizontal: wp(4),
    paddingVertical: hp(4),
    paddingBottom: 10
  },
  manhwaContainer: {
    width: '100%', 
    gap: 10, 
    alignItems: "center", 
    paddingHorizontal: wp(4), 
    paddingBottom: hp(8)
  },
  image: {
    width: '100%',
    maxWidth: wp(92),
    height: 520, 
    borderRadius: 4
  },
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.gray
  }
})
