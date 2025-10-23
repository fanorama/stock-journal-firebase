<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from '@/firebase/auth'
import { getAuthErrorMessage } from '@/firebase/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()

// Form state
const email = ref('')
const emailError = ref('')
const formError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

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
 * Handle password reset
 */
const handleResetPassword = async () => {
  // Clear previous messages
  formError.value = ''
  successMessage.value = ''
  emailError.value = ''

  // Validate email
  const isEmailValid = validateEmail()

  if (!isEmailValid) {
    return
  }

  isLoading.value = true

  try {
    await resetPassword(email.value)

    // Show success message
    successMessage.value =
      'Email reset password telah dikirim! Silakan cek inbox Anda untuk instruksi lebih lanjut.'

    // Clear email field
    email.value = ''

    // Redirect to login after 5 seconds
    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } catch (error: any) {
    formError.value = getAuthErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Clear error when user starts typing
 */
const clearEmailError = () => {
  emailError.value = ''
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
          Reset password Anda
        </p>
      </div>

      <!-- Reset Password Form Card -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <!-- Success Alert -->
        <div v-if="successMessage" class="mb-4 p-3 bg-[#10b981] border-[3px] border-black text-white font-bold">
          {{ successMessage }}
        </div>

        <!-- Error Alert -->
        <div v-if="formError" class="mb-4 p-3 bg-[#ef4444] border-[3px] border-black text-white font-bold">
          {{ formError }}
        </div>

        <!-- Info Message -->
        <div v-if="!successMessage" class="mb-6 p-3 bg-[#3b82f6] border-[3px] border-black text-white">
          <p class="font-bold mb-1">Lupa password?</p>
          <p class="text-sm">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Email
            </label>
            <input id="email" v-model="email" type="email" autocomplete="email" placeholder="trader@example.com"
              @input="clearEmailError" @blur="validateEmail" :disabled="isLoading || !!successMessage"
              class="w-full bg-[#fafafa] border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] placeholder-[#525252] focus:outline-none focus:ring-4 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]': emailError }" />
            <p v-if="emailError" class="mt-2 text-sm font-bold text-[#ef4444]">
              {{ emailError }}
            </p>
          </div>

          <!-- Reset Password Button -->
          <button type="submit" :disabled="isLoading || !!successMessage"
            class="w-full bg-[#f59e0b] border-[3px] border-black px-6 py-3 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span v-if="isLoading">Mengirim...</span>
            <span v-else-if="successMessage">Email Terkirim</span>
            <span v-else>Kirim Link Reset</span>
          </button>
        </form>

        <!-- Back to Login Link -->
        <div class="mt-6 text-center">
          <router-link to="/login" class="inline-flex items-center gap-2 text-sm font-bold text-[#3b82f6] hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Login</span>
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
