import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '../../features/auth/AuthContext';

export default function ProfileScreen() {
  const { user, isUserLoading, updateProfile, refreshUser, signOut } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const [errors, setErrors] = useState({});

  // Sync name field when the user object first arrives (or identity changes).
  // Guarded by `user?._id` so we don't clobber the field while the user is editing.
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?._id]);

  const handleRetry = async () => {
    try {
      await refreshUser();
    } catch {
      // refreshUser re-throws; we already show the retry state via `!user`
    }
  };

  if (isUserLoading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Could not load profile.</Text>
        <Text style={styles.retry} onPress={handleRetry}>
          Tap to retry
        </Text>
        <Button mode="text" onPress={signOut} style={{ marginTop: 16 }}>
          Log out
        </Button>
      </View>
    );
  }

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Name is required';
    if (password || confirm) {
      if (password.length < 6) next.password = 'At least 6 characters';
      if (password !== confirm) next.confirm = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const patch = {};
    if (name.trim() !== user.name) patch.name = name.trim();
    if (password) patch.password = password;

    if (Object.keys(patch).length === 0) {
      setSnack('Nothing to update.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(patch);
      setPassword('');
      setConfirm('');
      setSnack('Profile updated.');
    } catch (err) {
      setSnack(err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium">Account</Text>
            <Text style={styles.email}>{user.email}</Text>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="New password (optional)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              error={!!errors.password}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            <TextInput
              label="Confirm new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              mode="outlined"
              error={!!errors.confirm}
            />
            <HelperText type="error" visible={!!errors.confirm}>
              {errors.confirm}
            </HelperText>

            <Button
              mode="contained"
              onPress={onSave}
              loading={saving}
              disabled={saving}
              style={{ marginTop: 8 }}
            >
              Save changes
            </Button>
          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: 8 }} />

        <Button
          mode="outlined"
          icon="logout"
          onPress={signOut}
          textColor="#c62828"
        >
          Log out
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={3000}
      >
        {snack}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  email: { marginTop: 4, opacity: 0.7 },
  retry: { marginTop: 8, color: '#6200ee' },
});