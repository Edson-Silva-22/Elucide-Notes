export const useProjectStore = defineStore('project', () => {
  const projects = ref([
    {
      id: '123',
      title: 'Minha Rotina',
    },
    {
      id: '456',
      title: 'Trabalho da Escola',
    },
    {
      id: '789',
      title: 'Traino da Semana',
    }
  ])
  const projectSelected = ref(JSON.parse(localStorage.getItem('projectSelected')!) ?? null)

  return {
    projects,
    projectSelected
  }
})