import type { RouteRecordRaw } from "vue-router";

const usersRouter: RouteRecordRaw[] = [
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/users/pages/register.vue')
  }
]

export default usersRouter