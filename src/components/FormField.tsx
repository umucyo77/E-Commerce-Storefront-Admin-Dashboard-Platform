import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormFieldProps {
  label: string
  type?: string
  placeholder?: string
  register: UseFormRegisterReturn
  error?: FieldError
}

export function FormField({
  label,
  type = 'text',
  placeholder,
  register,
  error,
}: FormFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className={error ? 'input error' : 'input'}
        {...register}
      />
      {error && <small className="error-text">{error.message}</small>}
    </label>
  )
}

