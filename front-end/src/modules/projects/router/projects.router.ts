import Default from "@/layouts/default.vue";
import type { RouteRecordRaw } from "vue-router";

const projectsRouter: RouteRecordRaw[] = [
  {
    path: "/",
    component: Default,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/modules/projects/pages/home.vue"),
      },
      {
        path: '/create-project',
        name: 'create-project',
        component: () => import('@/modules/projects/pages/createProject.vue')
      }
    ],
  },
];

export default projectsRouter;
