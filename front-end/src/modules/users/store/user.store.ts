import { useApi } from "@/plugins/http-client"
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserDto {
  name: string
  email: string
  password: string
}

export interface User {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export const useUserStore = defineStore('user', () => {
  const loading = ref(false)
  
  async function create(userDto: UserDto) {
    loading.value = true
    const response = await useApi('post', 'users', userDto)

    loading.value = false
    if(response) return response
  }

  return{
    create,
    loading
  }
})