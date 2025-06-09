import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from '../navigation/HomeTabs';
import JobsDetailScreen from '../screens/JobsDetailScreen';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';
import DrawerNavigator from './DrawerNavigator';

export type RootStackParamList = {
    Login: undefined;
    HomeTabs: undefined;
    ForgotPassword: undefined;
    Register: undefined;
    JobsDetail: { id: string };
    ProfileEdit: undefined;
    Drawer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
            <Stack.Screen name="JobsDetail" component={JobsDetailScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        </Stack.Navigator>
    );
};
;

export default RootNavigator;
