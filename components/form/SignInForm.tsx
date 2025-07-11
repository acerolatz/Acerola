import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { OugiUser } from '@/helpers/types';
import { dbPopulateReadingStatusTable } from '@/lib/database';
import {
    spFetchUser,
    spGetSession,
    supabase
} from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator, Keyboard, KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';

const schema = yup.object().shape({  
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required'),  
});


interface FormData {
    email: string
    password: string
}


const SignInForm = () => {
    
    const db = useSQLiteContext()
    const { login, logout } = useAuthState()  
    const [isLoading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            email: '',
            password: '',            
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        
        setLoading(true)

            const { error } = await supabase.auth.signInWithPassword({
                email: form_data.email,
                password: form_data.password
            })

            if (error) {
                Toast.show(ToastMessages.EN.GENERIC_ERROR)
                setLoading(false)
                return
            }
        
            const session = await spGetSession()

            if (!session) {
                Toast.show(ToastMessages.EN.GENERIC_SERVER_ERROR)
                setLoading(false)
                return
            }        

            const user: OugiUser | null = await spFetchUser(session.user.id)    

            if (!user) {
                Toast.show(ToastMessages.EN.GENERIC_SERVER_ERROR)
                setLoading(false)
                logout()
                return
            } else {
                await dbPopulateReadingStatusTable(db, session.user.id)
                login(user, session)
                Toast.show({text1: "Login successful!", text2: `Welcome back, ${user.username}`, type: 'success'})
            }

        setLoading(false)        
        router.replace("/(pages)/HomePage")
    };

  return (
    <KeyboardAvoidingView style={{width: '100%', gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >

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
                    autoComplete='email'                    
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.email && (<Text style={AppStyle.error}>{errors.email.message}</Text>)}
            
            {/* Password */}
            <Text style={AppStyle.inputHeaderText}>Password</Text>
            <View>
                <Controller
                    name="password"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}                    
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
                <Pressable onPress={() => setShowPassword(prev => !prev)} style={{position: 'absolute', height: '100%', right: 10, justifyContent: "center"}} >
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={Colors.accountColor} />
                </Pressable>
            </View>
            {errors.password && (<Text style={AppStyle.error}>{errors.password.message}</Text>)}
    
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Login</Text>
                }
            </Pressable>

            {/* Don't Have an Account? */}
            <View style={{flexDirection: "row", marginTop: 20, gap: 4}} >
                <Text style={{color: Colors.white, fontSize: 14}} >Don't Have an Account?</Text> 
                <Pressable onPress={() => router.replace("/(auth)/SignUpPage")}  hitSlop={{left: 10, top: 10, bottom: 10, right: 10}} >
                    <Text style={{textDecorationLine: "underline", fontWeight: "bold", color: Colors.accountColor, fontSize: 14}} >Register</Text> 
                </Pressable>
            </View>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignInForm
