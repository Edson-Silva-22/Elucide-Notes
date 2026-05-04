import { useApi } from "@/plugins/http-client"

export enum TaskStatus {
  NOT_STARTED = 'not started',
  IN_PROGRESS = 'in progress',
  IN_REVIEW = 'in review',
  DONE = 'done',
}

export interface Task {
  _id: string
  code: number
  title: string
  status: TaskStatus
  description: string
  tags: {
    id: string
    name: string
  }[]
  createdAt: string
  updatedAt: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[] | []>([])
  const loading = ref(false)

  async function create(projectId: string, task: Partial<Task>) {
    loading.value = true

    const response = await useApi('post', `/projects/${projectId}/tasks`, task)

    if (response) tasks.value.unshift(response as never)

    loading.value = false
    return response
  }

  async function findAll(projectId: string) {
    loading.value = true

    const response = await useApi('get', `/projects/${projectId}/tasks`)
    
    if (response) tasks.value = response.data

    loading.value = false
  }

  async function remove(projectId: string, taskId: string) {
    loading.value = true
    const response = await useApi('delete', `/projects/${projectId}/tasks/${taskId}`)

    if (response) {
      tasks.value = tasks.value.filter(task => task._id !== taskId)
    }

    loading.value = false
    return response
  }

  return {
    create,
    findAll,
    remove,
    tasks,
    loading
  }
})