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
        path: 'project-not-selected',
        name: 'project-not-selected',
        component: () => import("@/modules/projects/pages/projectNotSelected.vue"),
      }
    ],
  },
];

export default projectsRouter;
