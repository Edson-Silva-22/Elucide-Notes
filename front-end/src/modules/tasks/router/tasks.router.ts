import type { RouteRecordRaw } from "vue-router";
import Default from "@/layouts/default.vue";

const taksRoutes: RouteRecordRaw[] = [
  {
    path: '/tasks',
    component: Default,
    children: [
      {
        path: '',
        name: 'tasks',
        component: () => import('../pages/tasks.vue'),
      }
    ]
  },
  {
    path: '/task-board',
    component: Default,
    children: [
      {
        path: '',
        name: 'task-board',
        component: () => import('@/modules/tasks/pages/taskBoard.vue')
      }
    ]
  }
]

export default taksRoutes;