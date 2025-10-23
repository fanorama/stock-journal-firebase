<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const formError = ref('')
const successMessage = ref('')

// Loading state
const isLoading = computed(() => authStore.isLoading)

/**
 * Validate display name
 */
const validateDisplayName = (): boolean => {
  displayNameError.value = ''

  if (!displayName.value) {
    displayNameError.value = 'Nama wajib diisi'
    return false
  }

  if (displayName.value.length < 3) {
    displayNameError.value = 'Nama minimal 3 karakter'
    return false
  }

  return true
}

/**
 * Validate email format
 */
const validateEmail = (): boolean => {
  emailError.value = ''

  if (!email.value) {
    emailError.value = 'Email wajib diisi'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Format email tidak valid'
    return false
  }

  return true
}

/**
 * Validate password
 */
const validatePassword = (): boolean => {
  passwordError.value = ''

  if (!password.value) {
    passwordError.value = 'Password wajib diisi'
    return false
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password minimal 6 karakter'
    return false
  }

  return true
}

/**
 * Validate confirm password
 */
const validateConfirmPassword = (): boolean => {
  confirmPasswordError.value = ''

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi password wajib diisi'
    return false
  }

  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Password tidak cocok'
    return false
  }

  return true
}

/**
 * Handle registration
 */
const handleRegister = async () => {
  // Clear previous messages
  formError.value = ''
  successMessage.value = ''
  displayNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validate form
  const isDisplayNameValid = validateDisplayName()
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isDisplayNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  try {
    await authStore.register(email.value, password.value, displayName.value)

    // Show success message
    successMessage.value = 'Pendaftaran berhasil! Email verifikasi telah dikirim. Silakan cek inbox Anda.'

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error: any) {
    formError.value = authStore.error || 'Pendaftaran gagal. Silakan coba lagi.'
  }
}

/**
 * Handle Google OAuth registration
 */
const handleGoogleRegister = async () => {
  formError.value = ''
  successMessage.value = ''

  try {
    await authStore.loginWithGoogleOAuth()

    // Redirect to dashboard
    router.push('/')
  } catch (error: any) {
    formError.value = authStore.error || 'Pendaftaran dengan Google gagal. Silakan coba lagi.'
  }
}

/**
 * Clear errors when user starts typing
 */
const clearDisplayNameError = () => {
  displayNameError.value = ''
  formError.value = ''
}

const clearEmailError = () => {
  emailError.value = ''
  formError.value = ''
}

const clearPasswordError = () => {
  passwordError.value = ''
  formError.value = ''
}

const clearConfirmPasswordError = () => {
  confirmPasswordError.value = ''
  formError.value = ''
}
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md p-4 py-8">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
          Stock Journal
        </h1>
        <p class="text-[#525252] font-mono text-sm">
          Buat akun baru
        </p>
      </div>

      <!-- Register Form Card -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <!-- Success Alert -->
        <div v-if="successMessage" class="mb-4 p-3 bg-[#10b981] border-[3px] border-black text-white font-bold">
          {{ successMessage }}
        </div>

        <!-- Error Alert -->
        <div v-if="formError" class="mb-4 p-3 bg-[#ef4444] border-[3px] border-black text-white font-bold">
          {{ formError }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Display Name Input -->
          <div>
            <label for="displayName" class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Nama
            </label>
            <input id="displayName" v-model="displayName" type="text" autocomplete="name" placeholder="John Doe"
              @input="clearDisplayNameError" @blur="validateDisplayName" :disabled="isLoading"
              class="w-full bg-[#fafafa] border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] placeholder-[#525252] focus:outline-none focus:ring-4 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]': displayNameError }" />
            <p v-if="displayNameError" class="mt-2 text-sm font-bold text-[#ef4444]">
              {{ displayNameError }}
            </p>
          </div>

          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Email
            </label>
            <input id="email" v-model="email" type="email" autocomplete="email" placeholder="trader@example.com"
              @input="clearEmailError" @blur="validateEmail" :disabled="isLoading"
              class="w-full bg-[#fafafa] border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] placeholder-[#525252] focus:outline-none focus:ring-4 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]': emailError }" />
            <p v-if="emailError" class="mt-2 text-sm font-bold text-[#ef4444]">
              {{ emailError }}
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Password
            </label>
            <input id="password" v-model="password" type="password" autocomplete="new-password"
              placeholder="••••••••" @input="clearPasswordError" @blur="validatePassword" :disabled="isLoading"
              class="w-full bg-[#fafafa] border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] placeholder-[#525252] focus:outline-none focus:ring-4 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]': passwordError }" />
            <p v-if="passwordError" class="mt-2 text-sm font-bold text-[#ef4444]">
              {{ passwordError }}
            </p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirmPassword" class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Konfirmasi Password
            </label>
            <input id="confirmPassword" v-model="confirmPassword" type="password" autocomplete="new-password"
              placeholder="••••••••" @input="clearConfirmPasswordError" @blur="validateConfirmPassword"
              :disabled="isLoading"
              class="w-full bg-[#fafafa] border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] placeholder-[#525252] focus:outline-none focus:ring-4 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]': confirmPasswordError }" />
            <p v-if="confirmPasswordError" class="mt-2 text-sm font-bold text-[#ef4444]">
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- Register Button -->
          <button type="submit" :disabled="isLoading"
            class="w-full bg-[#f59e0b] border-[3px] border-black px-6 py-3 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span v-if="isLoading">Loading...</span>
            <span v-else>Daftar</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t-[3px] border-black border-dashed"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-6 bg-white font-bold uppercase text-[#525252] tracking-widest">
              Atau
            </span>
          </div>
        </div>

        <!-- Google Sign-up Button -->
        <button type="button" @click="handleGoogleRegister" :disabled="isLoading"
          class="w-full bg-white border-[3px] border-black px-6 py-3 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3">
          <!-- Google Icon SVG -->
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4" />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853" />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05" />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335" />
          </svg>
          <span v-if="isLoading">Loading...</span>
          <span v-else>Daftar dengan Google</span>
        </button>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-[#525252] font-mono">
            Sudah punya akun?
            <router-link to="/login" class="font-bold text-[#f59e0b] hover:underline ml-1">
              Login sekarang
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
