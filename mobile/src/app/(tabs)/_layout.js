import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, navigation }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderTab = ({ name, icon, label }) => {
    const routeIndex = state.routes.findIndex((r) => r.name === name);
    if (routeIndex === -1) return null;
    const isFocused = state.index === routeIndex;
    const color = isFocused ? '#6200ee' : '#8a8a8a';

    const onPress = () => {
      const route = state.routes[routeIndex];
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={name}
        onPress={onPress}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
      >
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {renderTab({ name: 'index', icon: 'home', label: 'Home' })}
      {renderTab({ name: 'transactions', icon: 'format-list-bulleted', label: 'Trans.' })}

      <View style={styles.plusWrapper}>
        <Pressable
          onPress={() => router.push('/add-transaction')}
          style={styles.plusButton}
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </Pressable>
      </View>

      {renderTab({ name: 'tools', icon: 'wrench', label: 'Tools' })}
      {renderTab({ name: 'profile', icon: 'account-circle', label: 'Profile' })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: true }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    paddingHorizontal: 4,
    minHeight: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: { fontSize: 11, marginTop: 2 },
  plusWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24, // pops above the bar
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});