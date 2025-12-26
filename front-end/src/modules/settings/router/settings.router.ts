import Default from "@/layouts/default.vue";
import type { RouteRecordRaw } from "vue-router";

export const settingsRouter: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: Default,
    children: [
      {
        path: '',
        name: 'settings',
        component: () => import('@/modules/settings/pages/settings.vue'),
      }
    ]
  }
]