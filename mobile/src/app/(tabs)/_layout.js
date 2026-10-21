import { Tabs } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/AuthContext';

export default function TabsLayout() {
  const { signOut } = useAuth();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerRight: () => (
            <IconButton icon="logout" onPress={signOut} accessibilityLabel="Logout" />
          ),
        }}
      />
    </Tabs>
  );
}