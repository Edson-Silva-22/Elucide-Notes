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
  }
]

export default taksRoutes;