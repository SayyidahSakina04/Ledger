import { Controller, type Control, type FieldValues, type Path, } from 'react-hook-form';
import { Field, type FieldProps } from './Field';

// A Field wired to React Hook Form. The form owns the value; this connects the
// custom Input to it through Controller and surfaces the field's validation error.
type ControlledFieldProps<T extends FieldValues> = Omit<
  FieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

export function ControlledField<T extends FieldValues>({
  control,
  name,
  ...fieldProps
}: ControlledFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Field
          {...fieldProps}
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
