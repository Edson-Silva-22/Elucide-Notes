import authRoutes from "@/modules/auth/router/auth.router"
import { useAuthStore } from "@/modules/auth/store/auth.store"
import projectsRouter from "@/modules/projects/router/projects.router"
import { settingsRouter } from "@/modules/settings/router/settings.router"
import taksRoutes from "@/modules/tasks/router/tasks.router"
import usersRouter from "@/modules/users/router/users.router"
import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from "vue-router"

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
    ...projectsRouter,
    ...settingsRouter
  ]
})

router.beforeEach(async (to: RouteLocationNormalizedLoaded) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    const isAuthenticated = await authStore.me()

    if (isAuthenticated) {
      return true
    }

    else {
      return { path: '/login' }
    }
  }

  else {
    return true
  }
})

export default router