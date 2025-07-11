import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { spChangeUserInfos } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { PostgrestError } from '@supabase/supabase-js';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';


const schema = yup.object().shape({  
    name: yup
        .string()
        .min(AppConstants.USERNAME_MIN_LENGTH, `Username must be at least ${AppConstants.USERNAME_MIN_LENGTH} characters`)        
        .max(AppConstants.USERNAME_MAX_LENGTH, `Max ${AppConstants.USERNAME_MAX_LENGTH} characters`)
        .required('Username is required'),
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required')
});

interface FormData {
    name: string
    email: string
}


const ChangeProfileInfoForm = () => {

    const [isLoading, setLoading] = useState(false)
    const { user, session, setUser } = useAuthState()
    const changingInfo = useRef(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: user ? user.username : '',
            email: session ? session.user.email! : ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        if (!user) {
            Toast.show(ToastMessages.EN.NOT_LOGGED_IN)
            return
        }

        if (changingInfo.current) { return }

        changingInfo.current = true
        Keyboard.dismiss()

        setLoading(true)
            const newUsername = form_data.name.trim()

            if (
                newUsername != user.username
            ) {
                const error: PostgrestError | null = await spChangeUserInfos(
                    user.user_id!, 
                    newUsername
                );

                if (error) {
                    console.log("error ChangeProfileInfoForm", error)
                    Toast.show({
                        text1: "Error", 
                        text2: error.message,
                        type: "error"
                    })
                } else {
                    setUser(
                        {
                            user_id: user.user_id,
                            username: newUsername,
                            profile_image_url: user.profile_image_url,
                            profile_image_width: user.profile_image_width,
                            profile_image_height: user.profile_image_height
                        }
                    )
                    Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
                }
            }

            // change email
            
        setLoading(false)
        changingInfo.current = false
    };

  return (
    <>
        {/* Username */}
        <Text style={AppStyle.inputHeaderText}>Username</Text>
        <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
                style={AppStyle.input}                    
                autoComplete='name'
                autoCapitalize='none'                    
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}/>
            )}
        />
        {errors.name && (<Text style={AppStyle.error}>{errors.name.message}</Text>)}

        {/* Email */}
        <Text style={AppStyle.inputHeaderText}>Email</Text>
        <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
                style={AppStyle.input}                    
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}/>
            )}
        />
        {errors.email && (<Text style={AppStyle.error}>{errors.email.message}</Text>)}

        {/* Save Changes Button */}
        <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor}]} >
            {
                isLoading ? 
                <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                <Text style={AppStyle.formButtonText} >Save</Text>
            }
        </Pressable>        
    </>
  )
}

export default ChangeProfileInfoForm


const styles = StyleSheet.create({
    input: {
        backgroundColor: Colors.gray1,
        borderRadius: 4,
        height: hp(30),
        fontSize: 18,
        paddingHorizontal: 10,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
    }
})