import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { spSetUserProfileImageUrl, supabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, PermissionsAndroid, Platform, Pressable, StyleSheet, View } from 'react-native'
import RNFS from 'react-native-fs'
import { launchImageLibrary } from 'react-native-image-picker'
import * as mime from 'react-native-mime-types'
import Toast from 'react-native-toast-message'
import ProfileImageBig from '../ProfileImageBig'


const ChangeProfileImageForm = () => {    
    const { user, changeProfileImage } = useAuthState()
    const [loading, setLoading] = useState(false)

    const [localPhoto, setLocalPhoto] = useState<{image_url: string, width: number, height: number} | null>(null)
  
    const uploadingPhoto = useRef(false)
  
    const requestPermissions = async () => {
      if (Platform.OS !== 'android') return true;
      try {        
        const storageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "Ononoki needs access to your photos",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
        );
  
        return storageGranted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    const handleResponse = async (response: any) => {
      if (response.didCancel) {
        Toast.show(ToastMessages.EN.OPERATION_CANCELLED)
      } else if (response.errorCode) {
        Toast.show({text1: 'Error', text2: response.errorMessage, type: 'error'})      
      } else if (response.assets && response.assets.length > 0) {
        const { uri, width, height } = response.assets[0];      
        uploadingPhoto.current = true
        await uploadToSupabase(uri, width, height);
        uploadingPhoto.current = false
      }
    };
  
    const handlePickPhoto = async () => {
      if (uploadingPhoto.current) { return }
      await requestPermissions();
  
      launchImageLibrary({
          mediaType: 'photo',
          includeBase64: false,        
        },(response: any) => {
          handleResponse(response);
        }
      );
    };
  
    const decode = (base64: any) => {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    };
  
    const uploadToSupabase = async (uri: string, width: number, height: number) => {    
      if (!user) {
        Toast.show(ToastMessages.EN.NOT_LOGGED_IN)
        return
      }
  
      setLoading(true);
      
      try {      
        const mimeType = mime.lookup(uri) || 'image/jpeg';   
        const fileData = await RNFS.readFile(uri, 'base64');
        const filePath = `${user.user_id}/${Date.now()}.jpg`;
              
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(fileData), {
            contentType: mimeType,
            upsert: false
          });
  
        if (error) throw error;
        
        const publicUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl
        const profileUpdateError = await spSetUserProfileImageUrl(user!.user_id!, publicUrl, width, height);
        if (profileUpdateError) {
          Toast.show({text1: "Error", text2: profileUpdateError.message, type: "error"})
        } else {
          changeProfileImage(publicUrl, width, height)
          setLocalPhoto({image_url: uri, width, height})
          Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        }
      } catch (error: any) {
        console.error('Erro no upload:', error);
      } finally {
        setLoading(false);
      }
  
    };

    if (localPhoto) {
      return (
        <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
          <View style={{marginBottom: 20}} >
            <ProfileImageBig image_url={{uri: localPhoto.image_url}} width={localPhoto.width} height={localPhoto.height} />
            <Pressable onPress={handlePickPhoto} style={styles.brush} >
              {
                loading ? 
                <ActivityIndicator size={28} color={Colors.backgroundColor} /> :
                <Ionicons name='brush-outline' size={20} color={Colors.backgroundColor} />
              }
            </Pressable>
          </View>
        </View>    
      )
    }

    return (
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
          <View style={{marginBottom: 20}} >
            <ProfileImageBig image_url={user!.profile_image_url} width={user!.profile_image_width} height={user!.profile_image_height} />          
            <Pressable onPress={handlePickPhoto} style={styles.brush} >
              {
                loading ? 
                <ActivityIndicator size={28} color={Colors.backgroundColor} /> :
                <Ionicons name='brush-outline' size={20} color={Colors.backgroundColor} />
              }
            </Pressable>
          </View>
      </View>
    )
}

export default ChangeProfileImageForm

const styles = StyleSheet.create({
    brush: {
    backgroundColor: Colors.accountColor, 
    borderWidth: 2,
    borderColor: Colors.backgroundColor,
    padding: 10, 
    borderRadius: 42,
    position: 'absolute', 
    right: 4,
    bottom: 4
  }
})