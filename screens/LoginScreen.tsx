import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppConfig } from '@config/hirovo-config';
import { IAMAPI } from '@api/base_modules/iam';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { RootStackParamList } from '../navigation/RootNavigator';

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { jwtDecode } from 'jwt-decode';

import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import { getCurrentLocation } from '../src/hooks/useLocation';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';


const isExpoGo = Constants.appOwnership === 'expo';

const redirectUri = isExpoGo
  ? AuthSession.getRedirectUrl()
  : AuthSession.makeRedirectUri({ scheme: 'hirovo' });




const schema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
});

type FormData = z.infer<typeof schema>;

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: Platform.select({
  //     android: __DEV__
  //       ? AppConfig.GoogleAndroidClientIdDev
  //       : AppConfig.GoogleAndroidClientIdProd,
  //     web: AppConfig.GoogleExpoClientId,
  //   }),
  //   redirectUri: redirectUri,
  //   scopes: ['profile', 'email'],
  // });
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'com.madentechnology.hirovomobilapp:/oauthredirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: AppConfig.GoogleAndroidClientIdProd,
    scopes: ['profile', 'email'],
    redirectUri, // yukarıda hazırladığın URI'yi ver
  });



  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === 'success') {
        try {
          const { authentication } = response;

          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${authentication?.accessToken}` },
          }).then(res => res.json());

          try {
            await IAMAPI.Users.Create.Request({
              userName: userInfo.email,
              firstName: userInfo.given_name || '',
              surname: userInfo.family_name || '',
              email: userInfo.email,
              password: 'Google',
              providerId: userInfo.sub,
              userType: IAMAPI.Enums.UserType.Worker,
              companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
              userSource: IAMAPI.Enums.UserSources.Google,
              description: 'Google ile kayıt',
            });
          } catch (_) { }

          const res = await IAMAPI.Auth.Login.Request({
            provider: 'Google',
            userName: '',
            password: '',
            token: authentication?.accessToken ?? '',
            platform: IAMAPI.Enums.ClientPlatforms.Mobile,
            isCompanyHolding: false,
            companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
          });

          await AsyncStorage.setItem('jwt', res.jwt);
          await AsyncStorage.setItem('refreshToken', res.refreshToken);

          const decoded: any = jwtDecode(res.jwt);
          const userId = decoded?.nameid;

          const location = await getCurrentLocation();
          if (location) {
            await HirovoAPI.Location.SetLocation.Request({
              userId,
              latitude: location.latitude,
              longitude: location.longitude,
              companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
            });
          }



          // await startBackgroundLocationTracking();
          navigation.reset({ index: 0, routes: [{ name: 'Drawer' }] });
        } catch (err: any) {
          Alert.alert(t('error.LOGIN_FAILED_TITLE') || 'Hata', err?.message ?? t('error.DEFAULT_ERROR'));
        }
      }
    };

    handleGoogleLogin();
  }, [response]);

  const onAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const res = await IAMAPI.Auth.Login.Request({
        provider: 'Apple',
        userName: '',
        password: '',
        token: credential.identityToken ?? '',
        platform: IAMAPI.Enums.ClientPlatforms.Mobile,
        isCompanyHolding: false,
        companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
      });

      await AsyncStorage.setItem('jwt', res.jwt);
      await AsyncStorage.setItem('refreshToken', res.refreshToken);

      const decoded: any = jwtDecode(res.jwt);
      const userId = decoded?.nameid;


      await HirovoAPI.Location.SetLocation.Request({
        userId,
        latitude: 40.712776,
        longitude: -74.005974,
        companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
      });


      navigation.reset({ index: 0, routes: [{ name: 'Drawer' }] });
    } catch (err: any) {
      Alert.alert('Apple Login Failed', err?.message ?? 'Error');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await IAMAPI.Auth.Login.Request({
        provider: 'native',
        userName: data.username,
        password: data.password,
        token: '',
        platform: IAMAPI.Enums.ClientPlatforms.Mobile,
        isCompanyHolding: false,
        companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
      });

      await AsyncStorage.setItem('jwt', response.jwt);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);

      const decoded: any = jwtDecode(response.jwt);
      const userId = decoded?.nameid;


      await HirovoAPI.Location.SetLocation.Request({
        userId,
        latitude: 40.712776,
        longitude: -74.005974,
        companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
      });


      // await startBackgroundLocationTracking();
      navigation.reset({ index: 0, routes: [{ name: 'Drawer' }] });
    } catch (err: any) {
      Alert.alert(t('error.LOGIN_FAILED_TITLE') || 'Hata', err?.message ?? t('error.DEFAULT_ERROR'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('ui.login.welcome') || 'Hoşgeldiniz'}</Text>
      <Text style={styles.subtitle}>{t('ui.login.subtitle') || 'Giriş yapınız'}</Text>

      {/* <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder={t('ui.login.usernamePlaceholder') || 'Kullanıcı Adı'}
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
            />
            {errors.username?.message ? <Text style={styles.error}>{errors.username.message}</Text> : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('ui.login.passwordPlaceholder') || 'Şifre'}
                secureTextEntry={!isPasswordVisible}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeButton}
              >
                <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            {errors.password?.message ? <Text style={styles.error}>{errors.password.message}</Text> : null}
          </View>
        )}
      />

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>{t('ui.login.forgotPassword') || 'Şifremi Unuttum'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>{t('ui.login.submit') || 'Giriş Yap'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.secondaryText}>{t('ui.login.register') || 'Kayıt Ol'}</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Google ile Giriş</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.appleButton} onPress={onAppleLogin}>
        <Text style={styles.buttonText}>Apple ile Giriş</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 8 },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  button: { backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  secondaryButton: { marginTop: 12, padding: 12, borderRadius: 8, borderColor: '#ccc', borderWidth: 1, alignItems: 'center' },
  secondaryText: { color: '#333' },
  link: { alignItems: 'flex-end', marginVertical: 8 },
  linkText: { color: '#007bff', fontSize: 14 },
  googleButton: { backgroundColor: '#db4437', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  appleButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
});
