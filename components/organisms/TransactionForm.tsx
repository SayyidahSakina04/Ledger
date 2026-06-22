import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
import { CategoryChip } from '@/components/molecules/CategoryChip';
import { ControlledField } from '@/components/molecules/ControlledField';
import { Text } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { uploadReceipt } from '@/lib/api/storage';
import { formatDate, parseISODate, toISODate } from '@/lib/format';
import type { TransactionInput } from '@/lib/types';

// Text inputs always give strings, so amount/date are validated as strings here
// and converted to their real types on submit. type/category/date aren't text
// fields — they're driven by watch + setValue.
const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => Number(v) > 0, 'Enter an amount greater than 0'),
  categoryId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  note: z.string().optional(),
  paymentMethod: z.string().optional(),
  // The storage path of an already-saved receipt (null = none). A freshly
  // picked image lives in local state until submit, when it's uploaded.
  receiptUrl: z.string().nullable(),
});
export type TransactionFormValues = z.infer<typeof schema>;

// Today as 'YYYY-MM-DD', the default date for a new transaction.
const today = toISODate(new Date());

const emptyValues: TransactionFormValues = {
  type: 'expense',
  amount: '',
  categoryId: null,
  date: today,
  note: '',
  paymentMethod: '',
  receiptUrl: null,
};

type TransactionFormProps = {
  // Pre-fills the form (edit). Omitted fields fall back to sensible defaults.
  initialValues?: Partial<TransactionFormValues>;
  submitLabel: string;
  // Receives the validated, typed input. Throw to surface an error in the form.
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
};

// The shared add/edit form. Owns validation and string→type conversion; the
// caller only provides initial values and what to do with the result.
export function TransactionForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { colors } = useTheme();
  const { session } = useSession();
  const { data: categories } = useCategories();
  const [showDatePicker, setShowDatePicker] = useState(false);
  // A newly picked image, held locally until submit uploads it.
  const [picked, setPicked] = useState<{
    uri: string;
    mimeType?: string | null;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyValues, ...initialValues },
  });

  // These aren't text fields, so we watch them and update via setValue.
  const type = watch('type');
  const categoryId = watch('categoryId');
  const date = watch('date');
  const receiptUrl = watch('receiptUrl');

  // Open the photo library, ask permission if needed, keep the picked image
  // locally (uploaded only on submit, so we never upload an abandoned form).
  const pickReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('root', { message: 'Photo library permission is needed.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPicked({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const removeReceipt = () => {
    setPicked(null);
    setValue('receiptUrl', null);
  };

  const hasReceipt = Boolean(picked) || Boolean(receiptUrl);

  const submit = handleSubmit(async (values) => {
    try {
      // Upload a freshly picked image now; otherwise keep whatever was saved.
      let finalReceiptUrl = values.receiptUrl;
      if (picked) {
        const userId = session?.user.id;
        if (!userId) throw new Error('Not signed in');
        finalReceiptUrl = await uploadReceipt(
          userId,
          picked.uri,
          picked.mimeType,
        );
      }

      await onSubmit({
        type: values.type,
        amount: Number(values.amount),
        category_id: values.categoryId,
        date: values.date,
        note: values.note?.trim() ? values.note.trim() : null,
        payment_method: values.paymentMethod?.trim()
          ? values.paymentMethod.trim()
          : null,
        receipt_url: finalReceiptUrl,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save';
      setError('root', { message });
    }
  });

  return (
    <ScrollView
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Type</Text>
        <View style={styles.toggle}>
          <Button
            title="Expense"
            variant={type === 'expense' ? 'primary' : 'secondary'}
            onPress={() => setValue('type', 'expense')}
            style={styles.toggleButton}
          />
          <Button
            title="Income"
            variant={type === 'income' ? 'primary' : 'secondary'}
            onPress={() => setValue('type', 'income')}
            style={styles.toggleButton}
          />
        </View>
      </View>

      <ControlledField
        control={control}
        name="amount"
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Category
        </Text>
        {/* Wraps onto multiple rows so every category is visible — no scroll. */}
        <View style={styles.chips}>
          {/* "None" leaves category_id null (it's optional in the schema). */}
          <CategoryChip
            label="None"
            selected={categoryId == null}
            onPress={() => setValue('categoryId', null)}
          />
          {categories?.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onPress={() => setValue('categoryId', c.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Date</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.dateButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text>{formatDate(date)}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={parseISODate(date)}
            mode="date"
            onChange={(event, selected) => {
              // Android closes itself; we mirror that for both platforms.
              setShowDatePicker(false);
              if (event.type === 'set' && selected) {
                setValue('date', toISODate(selected), { shouldValidate: true });
              }
            }}
          />
        ) : null}
      </View>

      <ControlledField
        control={control}
        name="note"
        label="Note"
        placeholder="What was it for?"
      />
      <ControlledField
        control={control}
        name="paymentMethod"
        label="Payment method"
        placeholder="card, cash, bank…"
        autoCapitalize="none"
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Receipt</Text>
        {picked ? (
          // A newly picked image previews from its local uri.
          <Image source={{ uri: picked.uri }} style={styles.receipt} />
        ) : receiptUrl ? (
          <Text style={{ color: colors.textMuted }}>
            A receipt is already attached.
          </Text>
        ) : null}
        <View style={styles.toggle}>
          <Button
            title={hasReceipt ? 'Replace' : 'Attach receipt'}
            variant="secondary"
            onPress={pickReceipt}
            style={styles.toggleButton}
          />
          {hasReceipt ? (
            <Button
              title="Remove"
              variant="secondary"
              onPress={removeReceipt}
              style={styles.toggleButton}
            />
          ) : null}
        </View>
      </View>

      {errors.root ? (
        <Text style={{ color: colors.danger }}>{errors.root.message}</Text>
      ) : null}

      <Button title={submitLabel} onPress={submit} loading={isSubmitting} />
      <Button title="Cancel" variant="secondary" onPress={onCancel} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg, paddingBottom: spacing.xl },
  field: { gap: spacing.xs },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggle: { flexDirection: 'row', gap: spacing.sm },
  toggleButton: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dateButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  receipt: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
});
