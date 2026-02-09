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
        meta: {
          requiresAuth: true,
        },
        component: () => import("@/modules/projects/pages/home.vue"),
      }
    ],
  },
];

export default projectsRouter;
