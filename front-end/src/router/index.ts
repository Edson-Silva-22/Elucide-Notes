import authRoutes from "@/modules/auth/router/auth.router"
import taksRoutes from "@/modules/tasks/router/tasks.router"
import { createRouter, createWebHistory } from "vue-router"

declare module 'vue-router' {
  interface RouteMeta {
    //permissões para acessar
    // roles?: string[]

    //exige autenticação
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...taksRoutes,
    ...authRoutes
  ]
})

export default router