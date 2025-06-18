import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from './HomeTabs';
import JobsDetailScreen from '../screens/JobsDetailScreen';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';
import DrawerNavigator, { DrawerParamList } from './DrawerNavigator';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';

export type RootStackParamList = {
    Login: undefined;
    HomeTabs: undefined;
    ForgotPassword: undefined;
    Register: undefined;
    JobsDetail: { id: string };
    ProfileEdit: undefined;
    Drawer: {
        screen?: keyof DrawerParamList;
        params?: object;
    };
    WorkerProfile: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();


type RootNavigatorProps = {
    initialRoute: 'Login' | 'Drawer';
};

const RootNavigator = ({ initialRoute }: RootNavigatorProps) => {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
            <Stack.Screen name="JobsDetail" component={JobsDetailScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>


    );
};



export default RootNavigator;
