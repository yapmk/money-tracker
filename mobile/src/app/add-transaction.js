import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  HelperText,
  SegmentedButtons,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';
import { CATEGORIES } from '../constants/categories';
import { useCreateTransaction } from '../hooks/useTransactions';

export default function AddTransactionScreen() {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState('');
  const createMutation = useCreateTransaction();

  const validate = () => {
    const next = {};
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      next.amount = 'Amount must be greater than 0';
    }
    if (!category) {
      next.category = 'Please select a category';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        type,
        amount: Number(amount),
        description: description.trim(),
        category,
        date: new Date().toISOString(),
      });
      router.back();
    } catch (err) {
      setSnack(err?.response?.data?.message || 'Failed to save transaction');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        error={!!errors.amount}
      />
      <HelperText type="error" visible={!!errors.amount}>
        {errors.amount}
      </HelperText>

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
      />

      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            selected={category === c}
            onPress={() => setCategory(c)}
          >
            {c}
          </Chip>
        ))}
      </View>
      <HelperText type="error" visible={!!errors.category}>
        {errors.category}
      </HelperText>

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createMutation.isPending}
        disabled={createMutation.isPending}
      >
        Save
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 32 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
});