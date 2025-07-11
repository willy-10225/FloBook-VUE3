import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import store from "@/store/index"
import auth from "@/assets/ts/auth"
import jwt_decode from "jwt-decode"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/Login",
    name: "Login",
    component: () => import("@/views/Account/Login.vue"),
  },
  {
    path: "/SignUp",
    name: "SignUp",
    component: () => import("@/views/Account/SignUp.vue"),
  },
  {
    path: "/Home",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/FlobookMaster",
    name: "FlobookMaster",
    component: () => import("@/views/FlobookMaster.vue"),
    children: [
      {
        path: "Monitor/Index",
        name: "Monitor",
        component: () => import("@/views/Monitor/Monitor.vue"),
      },
      {
        path: "Monitor/Detail/:ip?",
        name: "MonitorDetail",
        props: true,
        component: () => import("@/views/Monitor/Detail.vue"),
      },
      {
        path: "Monitor/HardwareHistory/:ip",
        name: "HardwareHistory",
        props: true,
        component: () => import("@/views/Monitor/HardwareHistory.vue"),
      },
      {
        path: "Monitor/LicenseHistory/:ip",
        name: "LicenseHistory",
        props: true,
        component: () => import("@/views/Monitor/LicenseHistory.vue"),
      },
      {
        path: "Monitor/LicenseTop100/:ip?",
        name: "CheckInTop200",
        props: true,
        component: () => import("@/views/Monitor/LicenseTop100.vue"),
      },
      {
        path: "Monitor/UnnormalUseList/:ip?",
        name: "OverAllowedList",
        props: true,
        component: () => import("@/views/Monitor/UnnormalUseList.vue"),
      },
      //     {
      //       path: "Track/Index",
      //       name: "Track",
      //       component: () => import("@/views/Track/Track.vue"),
      //     },
      //     {
      //       path: "Track/Knowledge",
      //       name: "KnowledgeDatabase",
      //       component: () => import("@/views/Track/Knowledge.vue"),
      //     },
      //     {
      //       path: "Track/Files",
      //       name: "Files",
      //       component: () => import("@/views/Track/Files.vue"),
      //     },
      //     {
      //       path: "Track/ProjectCreate",
      //       name: "CreateProject",
      //       component: () => import("@/views/Track/ProjectCreate.vue"),
      //     },
      //     {
      //       path: "Track/ProjectDetail",
      //       name: "ProjectDetail",
      //       props: true,
      //       component: () => import("@/views/Track/ProjectDetail.vue"),
      //     },
      //     {
      //       path: "Track/TeamStatistic",
      //       name: "TeamStatistic",
      //       component: () => import("@/views/Track/TeamStatistic.vue"),
      //     },
      //     {
      //       path: "Track/PersonalStatistic",
      //       name: "PersonalStatistic",
      //       component: () => import("@/views/Track/PersonalStatistic.vue"),
      //     },
      //     {
      //       path: "Solve/JobSubmission",
      //       name: "JobSubmission",
      //       component: () => import("@/views/Solve/JobSubmission.vue"),
      //     },
      //     {
      //       path: "Solve/JobManager",
      //       name: "JobManager",
      //       component: () => import("@/views/Solve/JobManager.vue"),
      //     },
      //     {
      //       path: "Solve/SolveConfig",
      //       name: "SolveConfig",
      //       component: () => import("@/views/Solve/SolveConfig.vue"),
      //     },
      //     {
      //       path: "Light/MonitorDetailLight",
      //       name: "MonitorDetailLight",
      //       component: () => import("@/views/Light/MonitorDetailLight.vue"),
      //     },
      //     {
      //       path: "Light/ProjectDetailLight",
      //       name: "ProjectDetailLight",
      //       props: true,
      //       component: () => import("@/views/Light/ProjectDetailLight.vue"),
      //     },
      //     {
      //       path: "Light/StatisticLight",
      //       name: "StatisticLight",
      //       component: () => import("@/views/Light/StatisticLight.vue"),
      //     },
      {
        path: "Account/Setting",
        name: "Setting",
        component: () => import("@/views/Account/Setting.vue"),
      },
      {
        path: "Account/Profile",
        name: "Profile",
        component: () => import("@/views/Account/Profile.vue"),
      },
    ],
  },
  // {
  //   path: "/Lab1",
  //   name: "Lab1",
  //   component: () => import("@/views/Labs/Lab1.vue"),
  // },
  // {
  //   path: "/Lab2",
  //   name: "Lab2",
  //   component: () => import("@/views/Labs/Lab2.vue"),
  // },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/Home.vue"),
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const oldToken = localStorage.getItem("login_token")
  let tokenExpired = false
  let userInfo: any

  try {
    const flobookLicense = await store.dispatch("getFloBookLicense")

    if (oldToken) {
      try {
        const decoded = await auth.verifyToken(oldToken)
        userInfo = decoded.userInfo
        await store.dispatch("setUserInfo", userInfo)
        await store.dispatch("setFloBookLicense", flobookLicense)
        return checkFloBookLicense(to, from, next)
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          tokenExpired = true
        } else {
          await store.dispatch("removeUserInfo")
        }
      }
    }

    if (to.name === "Login" || to.name === "SignUp") return next()

    if (tokenExpired) {
      await store.dispatch("changeLoadingState", {
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        error: "loginAgainError",
      })
    }

    next({ name: "Login" })
  } catch (e) {
    console.error("License fetching error:", e)
    next({ name: "Login" })
  }
})
function checkFloBookLicense(to: any, from: any, next: any) {
  const lic = store.getters.flobookLicense
  const available =
    lic.HasTrack || lic.HasMonitor || lic.HasSolve || lic.HasLight
  const times: Date[] = []
  if (lic.MonitorData) times.push(new Date(lic.MonitorData.Time))
  if (lic.SolveData) times.push(new Date(lic.SolveData.EndTime))
  if (lic.LightData) times.push(new Date(lic.LightData.End))
  if (lic.TrackData) times.push(new Date(lic.TrackData.EndTime))
  const now = new Date()
  const maxEnd = new Date(Math.max(...times.map(t => t.getTime())))

  const expired = now > maxEnd
  if (expired) return expireLicense(next)
  if (!available) return rejectLicense(next)
  // 特定授權導向處理
  switch (to.name) {
    case "MonitorDetail":
    case "HardwareHistory":
    case "LicenseHistory":
      return lic.HasMonitor ? next() : next({ name: "MonitorDetailLight" })
    case "Files":
      return lic.HasTrack ? next() : next({ name: "Login" })
    case "ProjectDetail":
      return lic.HasTrack
        ? next()
        : next({ name: "ProjectDetailLight", params: to.params })
    case "TeamStatistic":
    case "PersonalStatistic":
      return lic.HasTrack ? next() : next({ name: "StatisticLight" })
    case "Home":
      return next()
    default:
      return next()
  }
}

function rejectLicense(next: any) {
  store.dispatch("changeLoadingState", {
    showDialog: true,
    isLoading: false,
    isSuccess: false,
    showAction: true,
    error: "LicenseError01",
  })
  next({ name: "Login" })
}

function expireLicense(next: any) {
  next({ name: "Login" })
}

export default router
