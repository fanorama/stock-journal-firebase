<script setup lang="ts">
import { ref } from 'vue'
import type { StrategyInput, StrategyRule } from '@/types'
import { useStrategiesStore } from '@/stores'
import RuleBuilder from './RuleBuilder.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [strategyId: string]
}>()

const strategiesStore = useStrategiesStore()

// Form state
const formData = ref<StrategyInput>({
  name: '',
  description: '',
  entryRules: [],
  exitRules: [],
  tags: [],
})

// Tag input for adding new tags
const tagInput = ref('')

// Validation errors
const errors = ref<Partial<Record<keyof StrategyInput, string>>>({})

// Local loading state
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

/**
 * Add tag
 */
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags?.includes(tag)) {
    formData.value.tags = [...(formData.value.tags || []), tag]
    tagInput.value = ''
  }
}

/**
 * Remove tag
 */
const removeTag = (tagToRemove: string) => {
  formData.value.tags = formData.value.tags?.filter((t) => t !== tagToRemove) || []
}

/**
 * Validate form
 */
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama strategy wajib diisi'
  } else if (formData.value.name.trim().length < 3) {
    errors.value.name = 'Nama strategy minimal 3 karakter'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Nama strategy maksimal 100 karakter'
  }

  if (formData.value.description && formData.value.description.length > 500) {
    errors.value.description = 'Deskripsi maksimal 500 karakter'
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    const strategyId = await strategiesStore.createStrategy(formData.value)

    // Reset form
    formData.value = {
      name: '',
      description: '',
      entryRules: [],
      exitRules: [],
      tags: [],
    }
    errors.value = {}

    emit('success', strategyId)
    emit('close')
  } catch (err: any) {
    submitError.value = err.message || 'Gagal membuat strategy'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle cancel/close
 */
const handleClose = () => {
  if (!isSubmitting.value) {
    // Reset form
    formData.value = {
      name: '',
      description: '',
      entryRules: [],
      exitRules: [],
      tags: [],
    }
    errors.value = {}
    submitError.value = null
    emit('close')
  }
}
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="handleClose"
    >
      <!-- Modal Container -->
      <div
        class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="bg-[#f59e0b] border-b-[5px] border-black p-6 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
              Buat Strategy Baru
            </h2>
            <button
              class="bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Submit Error Alert -->
          <div
            v-if="submitError"
            class="bg-[#ef4444] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5 text-white flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <p class="text-white font-mono text-sm">{{ submitError }}</p>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Strategy Name -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Nama Strategy <span class="text-[#ef4444]">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#f59e0b] transition-all"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.name }"
                placeholder="e.g., RSI Oversold Strategy"
                maxlength="100"
                :disabled="isSubmitting"
              />
              <p v-if="errors.name" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.name }}
              </p>
            </div>

            <!-- Description (Optional) -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#f59e0b] transition-all resize-none"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.description }"
                placeholder="Deskripsi singkat strategy ini..."
                maxlength="500"
                :disabled="isSubmitting"
              ></textarea>
              <p v-if="errors.description" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.description }}
              </p>
              <p class="mt-1 text-xs text-[#525252] font-mono">
                {{ (formData.description || '').length }}/500 karakter
              </p>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Tags (Opsional)
              </label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="tagInput"
                  type="text"
                  class="flex-1 border-[3px] border-black px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  placeholder="e.g., Scalping"
                  :disabled="isSubmitting"
                  @keyup.enter="addTag"
                />
                <button
                  type="button"
                  class="bg-[#3b82f6] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
                  @click="addTag"
                  :disabled="isSubmitting"
                >
                  Add
                </button>
              </div>
              <div v-if="formData.tags && formData.tags.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="tag in formData.tags"
                  :key="tag"
                  class="bg-[#3b82f6] border-[2px] border-black px-3 py-1 text-sm font-bold uppercase text-white flex items-center gap-2"
                >
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)" class="hover:text-[#ef4444]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t-[3px] border-black"></div>

            <!-- Entry Rules -->
            <RuleBuilder v-model="formData.entryRules" label="Entry Rules" />

            <!-- Divider -->
            <div class="border-t-[3px] border-black"></div>

            <!-- Exit Rules -->
            <RuleBuilder v-model="formData.exitRules" label="Exit Rules" />

            <!-- Info Box -->
            <div class="bg-[#fef3c7] border-[3px] border-black p-4">
              <div class="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5 text-[#f59e0b] flex-shrink-0"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                <p class="text-sm text-[#0a0a0a] font-mono">
                  Strategy akan membantu Anda trading dengan lebih disiplin. Anda bisa link trades ke strategy untuk tracking performa.
                </p>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="bg-[#fafafa] border-t-[5px] border-black p-6 sticky bottom-0">
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              Batal
            </button>
            <button
              type="submit"
              class="bg-[#10b981] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-[2px] border-white border-t-transparent"></span>
              {{ isSubmitting ? 'Menyimpan...' : 'Buat Strategy' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Input and textarea text color - dark and visible */
input,
textarea,
select {
  color: #0a0a0a;
}

/* Placeholder styling - medium gray */
input::placeholder,
textarea::placeholder {
  color: #737373;
  opacity: 1;
}

/* Select option styling */
select option {
  color: #0a0a0a;
  background: white;
}
</style>
