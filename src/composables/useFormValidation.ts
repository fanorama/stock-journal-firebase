import { ref, type Ref } from 'vue'

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  error: string
}

/**
 * Validation rule type
 */
export type ValidationRule = (value: string) => ValidationResult

/**
 * Composable for form validation
 */
export function useFormValidation() {
  /**
   * Validate email format
   */
  const validateEmail = (email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, error: 'Email wajib diisi' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Format email tidak valid' }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validate password
   */
  const validatePassword = (password: string, minLength = 6): ValidationResult => {
    if (!password) {
      return { isValid: false, error: 'Password wajib diisi' }
    }

    if (password.length < minLength) {
      return { isValid: false, error: `Password minimal ${minLength} karakter` }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validate password confirmation
   */
  const validatePasswordConfirmation = (
    password: string,
    confirmPassword: string
  ): ValidationResult => {
    if (!confirmPassword) {
      return { isValid: false, error: 'Konfirmasi password wajib diisi' }
    }

    if (confirmPassword !== password) {
      return { isValid: false, error: 'Password tidak cocok' }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validate required field
   */
  const validateRequired = (value: string, fieldName: string): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${fieldName} wajib diisi` }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validate minimum length
   */
  const validateMinLength = (
    value: string,
    minLength: number,
    fieldName: string
  ): ValidationResult => {
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName} minimal ${minLength} karakter` }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validate display name
   */
  const validateDisplayName = (displayName: string): ValidationResult => {
    const requiredResult = validateRequired(displayName, 'Nama')
    if (!requiredResult.isValid) {
      return requiredResult
    }

    return validateMinLength(displayName, 3, 'Nama')
  }

  /**
   * Create field validator with reactive error state
   */
  const createFieldValidator = (validationRules: ValidationRule[]) => {
    const error: Ref<string> = ref('')

    const validate = (value: string): boolean => {
      error.value = ''

      for (const rule of validationRules) {
        const result = rule(value)
        if (!result.isValid) {
          error.value = result.error
          return false
        }
      }

      return true
    }

    const clearError = () => {
      error.value = ''
    }

    return {
      error,
      validate,
      clearError,
    }
  }

  return {
    // Validation functions
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateRequired,
    validateMinLength,
    validateDisplayName,

    // Field validator factory
    createFieldValidator,
  }
}
