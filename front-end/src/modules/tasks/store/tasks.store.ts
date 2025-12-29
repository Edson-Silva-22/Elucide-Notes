export enum TaskStatus {
  NOT_STARTED = 'not started',
  IN_PROGRESS = 'in progress',
  IN_REVIEW = 'in review',
  DONE = 'done',
}

export interface Task {
  id: string
  code: string
  title: string
  status: string
  description: string
  tags: {
    id: string
    name: string
  }[]
  createdAt: string
  updatedAt: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([
    {
      id: '1',
      code: 'TS-01',
      title: 'Tarefa 01',
      status: TaskStatus.NOT_STARTED,
      description: 'Descrição da tarefa 01',
      tags: [{ id: '1', name: 'Tag 01' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      code: 'TS-02',
      title: 'Tarefa 02',
      status: TaskStatus.NOT_STARTED,
      description: 'Descrição da tarefa 02',
      tags: [{ id: '2', name: 'Tag 02' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      code: 'TS-03',
      title: 'Tarefa 03',
      status: TaskStatus.NOT_STARTED,
      description: 'Descrição da tarefa 03',
      tags: [{ id: '3', name: 'Tag 03' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      code: 'TS-04',
      title: 'Tarefa 04',
      status: TaskStatus.NOT_STARTED,
      description: 'Descrição da tarefa 04',
      tags: [{ id: '4', name: 'Tag 04' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      code: 'TS-05',
      title: 'Tarefa 05',
      status: TaskStatus.NOT_STARTED,
      description: 'Descrição da tarefa 05',
      tags: [{ id: '5', name: 'Tag 05' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      code: 'TS-06',
      title: 'Tarefa 06',
      status: TaskStatus.IN_PROGRESS,
      description: 'Descrição da tarefa 06',
      tags: [{ id: '6', name: 'Tag 06' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '7',
      code: 'TS-07',
      title: 'Tarefa 07',
      status: TaskStatus.IN_PROGRESS,
      description: 'Descrição da tarefa 07',
      tags: [{ id: '7', name: 'Tag 07' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '8',
      code: 'TS-08',
      title: 'Tarefa 08',
      status: TaskStatus.IN_PROGRESS,
      description: 'Descrição da tarefa 08',
      tags: [{ id: '8', name: 'Tag 08' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '9',
      code: 'TS-09',
      title: 'Tarefa 09',
      status: TaskStatus.IN_PROGRESS,
      description: 'Descrição da tarefa 09',
      tags: [{ id: '9', name: 'Tag 09' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10',
      code: 'TS-10',
      title: 'Tarefa 10',
      status: TaskStatus.IN_PROGRESS,
      description: 'Descrição da tarefa 10',
      tags: [{ id: '10', name: 'Tag 10' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '11',
      code: 'TS-11',
      title: 'Tarefa 11',
      status: TaskStatus.IN_REVIEW,
      description: 'Descrição da tarefa 11',
      tags: [{ id: '11', name: 'Tag 11' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '12',
      code: 'TS-12',
      title: 'Tarefa 12',
      status: TaskStatus.IN_REVIEW,
      description: 'Descrição da tarefa 12',
      tags: [{ id: '12', name: 'Tag 12' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '13',
      code: 'TS-13',
      title: 'Tarefa 13',
      status: TaskStatus.IN_REVIEW,
      description: 'Descrição da tarefa 13',
      tags: [{ id: '13', name: 'Tag 13' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '14',
      code: 'TS-14',
      title: 'Tarefa 14',
      status: TaskStatus.IN_REVIEW,
      description: 'Descrição da tarefa 14',
      tags: [{ id: '14', name: 'Tag 14' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '15',
      code: 'TS-15',
      title: 'Tarefa 15',
      status: TaskStatus.IN_REVIEW,
      description: 'Descrição da tarefa 15',
      tags: [{ id: '15', name: 'Tag 15' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '16',
      code: 'TS-16',
      title: 'Tarefa 16',
      status: TaskStatus.DONE,
      description: 'Descrição da tarefa 16',
      tags: [{ id: '16', name: 'Tag 16' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '17',
      code: 'TS-17',
      title: 'Tarefa 17',
      status: TaskStatus.DONE,
      description: 'Descrição da tarefa 17',
      tags: [{ id: '17', name: 'Tag 17' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '18',
      code: 'TS-18',
      title: 'Tarefa 18',
      status: TaskStatus.DONE,
      description: 'Descrição da tarefa 18',
      tags: [{ id: '18', name: 'Tag 18' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '19',
      code: 'TS-19',
      title: 'Tarefa 19',
      status: TaskStatus.DONE,
      description: 'Descrição da tarefa 19',
      tags: [{ id: '19', name: 'Tag 19' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '20',
      code: 'TS-20',
      title: 'Tarefa 20',
      status: TaskStatus.DONE,
      description: 'Descrição da tarefa 20',
      tags: [{ id: '20', name: 'Tag 20' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ])

  return {
    tasks,
  }
})