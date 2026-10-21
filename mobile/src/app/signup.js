import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../features/auth/AuthContext';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const onSubmit = async () => {
    if (!name || !email || !password) {
      setSnack('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      setSnack(err?.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text variant="headlineMedium" style={styles.title}>Sign up</Text>
        <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
        />
        <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>
          Create account
        </Button>
        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <Link href="/login">Login</Link>
        </View>
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { textAlign: 'center', marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, alignItems: 'center' },
});