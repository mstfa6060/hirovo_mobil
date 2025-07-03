import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppConfig } from '@config/hirovo-config';
import { IAMAPI } from '@api/base_modules/iam';
import { RootStackParamList } from '../navigation/RootNavigator';

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

import '@config/i18n';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import App from 'App';
import { LanguageSelectorDropdown } from '../components/LanguageSelector';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';



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

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: AppConfig.GoogleAndroidClientIdDev,
    iosClientId: AppConfig.GoogleIosClientId,
    androidClientId: AppConfig.GoogleAndroidClientIdProd,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      IAMAPI.Auth.Login.Request({
        provider: 'Google',
        userName: '',
        password: '',
        token: authentication?.accessToken ?? '',
        platform: IAMAPI.Enums.ClientPlatforms.Mobile,
        isCompanyHolding: false,
        companyId: AppConfig.DefaultCompanyId,
      })
        .then(async res => {
          await AsyncStorage.setItem('jwt', res.jwt);
          await AsyncStorage.setItem('refreshToken', res.refreshToken);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Drawer', params: { screen: 'HomeTabs' } }],
          });
        })
        .catch(err => {
          Alert.alert(t('error.LOGIN_FAILED_TITLE'), err?.message ?? t('error.DEFAULT_ERROR'));
        });
    }
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
        userName: credential.email ?? '', // Apple'dan gelen e-posta adresi burada kullanılabilir
        password: '',
        token: credential.identityToken ?? '',
        platform: IAMAPI.Enums.ClientPlatforms.Mobile,
        isCompanyHolding: false,
        companyId: AppConfig.DefaultCompanyId,
      });

      await AsyncStorage.setItem('jwt', res.jwt);
      await AsyncStorage.setItem('refreshToken', res.refreshToken);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Drawer', params: { screen: 'HomeTabs' } }],
      });
    } catch (err: any) {
      Alert.alert('Apple Login Failed', err?.message ?? 'Error');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Login data:', data);
      const response = await IAMAPI.Auth.Login.Request({
        provider: 'native',
        userName: data.username,
        password: data.password,
        token: '',
        platform: IAMAPI.Enums.ClientPlatforms.Mobile,
        isCompanyHolding: false,
        companyId: AppConfig.DefaultCompanyId,
      });

      console.log('Login response:', response);

      await AsyncStorage.setItem('jwt', response.jwt);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Drawer', params: { screen: 'HomeTabs' } }],
      });
    } catch (err: any) {
      Alert.alert(t('error.LOGIN_FAILED_TITLE'), err?.message ?? t('error.DEFAULT_ERROR'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('ui.login.welcome')}</Text>
      <Text style={styles.subtitle}>{t('ui.login.subtitle')}</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder={t('ui.login.usernamePlaceholder')}
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
            />
            {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('ui.login.passwordPlaceholder')}
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
                <Ionicons
                  name={isPasswordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </>
        )}
      />

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>{t('ui.login.forgotPassword')}</Text>
      </TouchableOpacity>

      <LanguageSelectorDropdown />

      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>{t('ui.login.submit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.secondaryText}>{t('ui.login.register')}</Text>
      </TouchableOpacity>

      {/* 
      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Google ile Giriş</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.appleButton} onPress={onAppleLogin}>
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
