import authRoutes from "@/modules/auth/router/auth.router"
import projectsRouter from "@/modules/projects/router/projects.router"
import taksRoutes from "@/modules/tasks/router/tasks.router"
import usersRouter from "@/modules/users/router/users.router"
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
    ...authRoutes,
    ...usersRouter,
    ...projectsRouter
  ]
})

export default router