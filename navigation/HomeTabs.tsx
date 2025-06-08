import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JobsAllScreen from '../screens/JobsAllScreen';
// import WorkersScreen from '../screens/WorkersScreen'; // varsa
// import ApplicationsScreen from '../screens/ApplicationsScreen'; // varsa
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Eğer bu iki ekran henüz yazılmadıysa geçici içerik:
const WorkersPlaceholder = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Workers Screen</Text>
  </View>
);

const ApplicationsPlaceholder = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Applications Screen</Text>
  </View>
);

const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Jobs" component={JobsAllScreen} />
      <Tab.Screen name="Workers" component={WorkersPlaceholder} />
      <Tab.Screen name="Applications" component={ApplicationsPlaceholder} />
    </Tab.Navigator>
  );
};

export default HomeTabs;
