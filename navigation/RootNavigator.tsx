import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from '../navigation/HomeTabs';
import JobsDetailScreen from '../screens/JobsDetailScreen';

export type RootStackParamList = {
    Login: undefined;
    HomeTabs: undefined;
    ForgotPassword: undefined;
    Register: undefined;
    JobsDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="HomeTabs" component={HomeTabs} /> 
<Stack.Screen name="JobsDetail" component={JobsDetailScreen} />
            {/* Diğer ekranlar */}
        </Stack.Navigator>
    );
};

export default RootNavigator;
