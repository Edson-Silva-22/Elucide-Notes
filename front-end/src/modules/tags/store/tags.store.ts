import { useApi } from "@/plugins/http-client"

export interface Tag {
  _id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagDto {
  title: string
}

export interface UpdateTagDto extends CreateTagDto {}

export interface ListTagDto {
  keyword?: string
}

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[] | []>([])
  const loading = ref(false)

  async function create(projectId: string, createTagDto: CreateTagDto) {
    loading.value = true

    const response = await useApi('post', `projects/${projectId}/tags`, createTagDto)

    loading.value = false
    if(response) tags.value.unshift(response as never)
    return response
  }

  async function findAll(projectId: string, listTagDto?: ListTagDto) {
    loading.value = true
    let queryString = ''

    if(listTagDto?.keyword) queryString += `&keyword=${listTagDto.keyword}`
    
    const response = await useApi('get', `projects/${projectId}/tags?${queryString}`)

    loading.value = false

    if(response) {
      tags.value = response.data
      return response
    }
  }

  async function remove(projectId: string, id: string) {
    loading.value = true
    const response = await useApi('delete', `projects/${projectId}/tags/${id}`)
    loading.value = false

    if(response) {
      tags.value = tags.value.filter((tag) => tag._id !== id)
    }
    return response
  }

  return {
    tags,
    loading,
    create,
    findAll,
    remove
  }
})