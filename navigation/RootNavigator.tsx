import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from './HomeTabs';
import JobsDetailScreen from '../screens/JobsDetailScreen';
import DrawerNavigator, { DrawerParamList } from './DrawerNavigator';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';
import SignUpScreen from '../screens/SignUpScreen'; // doğru yolu senin yapına göre güncelle
import ProfileForm from 'screens/Profile/ProfileForm';
import ForgotPasswordScreen from 'screens/ForgotPasswordScreen';
import ResetPasswordScreen from 'screens/ResetPasswordScreen';
import JobApplicationsScreen from 'screens/JobApplicationsScreen';
import EditJobScreen from 'screens/EditJobScreen';
import ChangePasswordScreen from 'screens/ChangePasswordScreen';
import RegisterWithPhoneScreen from 'screens/RegisterWithPhoneScreen';
import OtpVerificationScreen from 'screens/OtpVerificationScreen';


export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Drawer: {
        screen?: keyof DrawerParamList;
        params?: object;
    };
    HomeTabs: undefined;
    JobsDetail: { id: string };
    ProfileEdit: undefined;
    WorkerProfile: { id: string };
    ForgotPassword: undefined;
    ForgotPasswordScreen: undefined; // Bu varsa `ForgotPassword` ile birleştirilebilir
    ResetPassword: { token: string };
    handleMyJobList: undefined;
    EditJobScreen: { jobId: string };
    JobApplicationsScreen: { jobId: string };
    OtpVerificationScreen: { phoneNumber: string; otpCode: string };
    RegisterWithPhone: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();


type RootNavigatorProps = {
    initialRoute: 'Login' | 'Drawer' | 'RegisterWithPhone';
};


const RootNavigator = ({ initialRoute }: RootNavigatorProps) => {
    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignUpScreen} />
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
            <Stack.Screen name="JobsDetail" component={JobsDetailScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileForm} />
            <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="JobApplicationsScreen" component={JobApplicationsScreen} />
            <Stack.Screen name="EditJobScreen" component={EditJobScreen} />
            <Stack.Screen name="RegisterWithPhone" component={RegisterWithPhoneScreen} />
            <Stack.Screen name="OtpVerificationScreen" component={OtpVerificationScreen} />

        </Stack.Navigator>
    );
};




export default RootNavigator;
