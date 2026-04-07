import { useApi } from "@/plugins/http-client"

export interface Project {
  _id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  title: string
  description?: string
}

export interface UpdateProjectDto extends CreateProjectDto {}

export interface ListProjectDto {
  keyword?: string
  page?: number
  limit?: number
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[] | []>([])
  const projectSelected = ref(JSON.parse(localStorage.getItem('projectSelected')!) ?? null)
  const loading = ref(false)

  async function create(createProjectDto: CreateProjectDto) {
    loading.value = true

    const response = await useApi('post', 'projects', createProjectDto)

    loading.value = false
    if(response) projects.value.push(response as never)
    return response
  }

  async function findAll(listProjectDto?: ListProjectDto) {
    loading.value = true
    let queryString = ''

    if(listProjectDto?.keyword) queryString += `&keyword=${listProjectDto.keyword}`

    if(listProjectDto?.page) queryString += `&page=${listProjectDto.page}`

    if(listProjectDto?.limit) queryString += `&limit=${listProjectDto.limit}`
    
    const response = await useApi('get', `projects/my-projects?${queryString}`)

    loading.value = false

    if(response) {
      projects.value = response.data
      return response
    }
  }

  async function update(projectId: string, updateProjectDto: UpdateProjectDto) {
    loading.value = true
    const response = await useApi('put', `projects/${projectId}`, updateProjectDto)

    loading.value = false
    if(response) {
      projects.value = projects.value.map(project => {
        if(project._id === projectId) {
          return {
            ...project,
            ...updateProjectDto
          }
        }
        return project
      })

      if(projectSelected.value?._id === projectId) {
        localStorage.setItem('projectSelected', JSON.stringify({
          ...projectSelected.value,
          ...updateProjectDto
        }))

        projectSelected.value = {
          ...projectSelected.value,
          ...updateProjectDto
        }
      }

      return response
    }
  }

  async function deleteProject(projectId: string) {
    loading.value = true
    const response = await useApi('delete', `projects/${projectId}`)

    loading.value = false
    if(response) {
      projects.value = projects.value.filter(project => project._id !== projectId)

      if(projectSelected.value?._id === projectId) {
        localStorage.removeItem('projectSelected')
        projectSelected.value = null
      }
      
      return response
    }
  }

  return {
    projects,
    projectSelected,
    loading,
    create,
    findAll,
    update,
    deleteProject
  }
})