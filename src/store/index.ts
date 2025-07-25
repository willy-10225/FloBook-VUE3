import { createStore } from "vuex"
import auth from "../assets/ts/auth.js"
import { apiGetFloBookLicense } from "../assets/ts/api.js"

export interface TrackData {
  HostId: string
  EndTime: string
  StartTime: string
  ExpiredDate: string
  UserNumber: number
}

interface TokenPayload {
  userInfo: UserInfo
  userName: string
  deviceIpList: any[]
  exp: number // 必須有這個屬性
}

export interface MonitorData {
  HostId: string
  Time: string
  SC: number
  PC: number
  SU: number
  PU: number
}

export interface SolveData {
  HostId: string
  EndTime: string
  StartTime: string
  ExpiredDate: string
}

export interface LightData {
  Start: string
  End: string
}

export interface FloBookLicense {
  HasTrack: boolean
  HasMonitor: boolean
  HasSolve: boolean
  HasLight: boolean
  TrackData?: TrackData
  MonitorData?: MonitorData
  SolveData?: SolveData
  LightData?: LightData
}

export interface UserInfo {
  userId: number
  displayName: string
  account: string
  name: string
  roles: string[]
  isAdmin: boolean
  email: string
}

export interface LoadingDialog {
  showDialog: boolean
  isLoading: boolean
  isSuccess: boolean | null
  showAction: boolean
  message: string
  error: string
  title: string
  isTimerNeeded?: boolean
}

const defaultUserInfo: UserInfo = {
  userId: 0,
  displayName: "",
  account: "",
  name: "",
  roles: [],
  isAdmin: false,
  email: "",
}

const defaultLoadingState: LoadingDialog = {
  showDialog: false,
  isLoading: false,
  isSuccess: null,
  showAction: false,
  message: "",
  error: "",
  title: "",
}

export interface RootState {
  lang: string
  versionOption: {
    official: boolean
    beta: boolean
  }
  flobookLicense: FloBookLicense
  isMobile: boolean
  loadingDialog: LoadingDialog
  timer: ReturnType<typeof setTimeout> | null
  callbackLoop: number
  userInfo: UserInfo
  layout: {
    isSidenavShown: boolean
    sidenavWidth: number
  }
  deviceIpList: any[]
  destination: string
}

const state: RootState = {
  lang: localStorage.getItem("lang") || "en-us",
  versionOption: {
    official: true,
    beta: false,
  },
  flobookLicense: JSON.parse(
    sessionStorage.getItem("flobookLicense") || "null"
  ) || {
    HasLight: false,
    HasMonitor: false,
    HasSolve: false,
    HasTrack: false,
  },
  isMobile: false,
  loadingDialog: { ...defaultLoadingState },
  timer: null,
  callbackLoop: 0,
  userInfo: JSON.parse(sessionStorage.getItem("userInfo") || "null") || {
    ...defaultUserInfo,
  },
  layout: JSON.parse(localStorage.getItem("layout") || "null") || {
    isSidenavShown: false,
    sidenavWidth: 200,
  },
  deviceIpList: JSON.parse(sessionStorage.getItem("deviceIpList") || "[]"),
  destination: "Home",
}

const getters = {
  lang: (state: RootState) => state.lang,
  versionOption: (state: RootState) => state.versionOption,
  flobookLicense: (state: RootState) => state.flobookLicense,
  isMobile: (state: RootState) => state.isMobile,
  userInfo: (state: RootState) => state.userInfo,
  layout: (state: RootState) => state.layout,
  loadingDialog: (state: RootState) => state.loadingDialog,
  deviceIpList: (state: RootState) => state.deviceIpList,
  destination: (state: RootState) => state.destination,
}

const mutations = {
  setSidenavShown(state: RootState, payload: boolean) {
    state.layout.isSidenavShown = payload
    localStorage.setItem("layout", JSON.stringify(state.layout))
  },
  changeLanguage(state: RootState, payload: string) {
    state.lang = payload
    localStorage.setItem("lang", payload)
  },
  updateFloBookLicense(state: RootState, payload: FloBookLicense) {
    state.flobookLicense = payload
    sessionStorage.setItem("flobookLicense", JSON.stringify(payload))
  },
  checkMobileAndTablet(state: RootState) {
    const regexArray = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ]
    state.isMobile = regexArray.some(reg => reg.test(navigator.userAgent))
  },
  changeLoadingState(
    state: RootState,
    payload: Partial<LoadingDialog> | (boolean & { isTimerNeeded?: boolean })
  ) {
    if (typeof payload === "boolean") {
      payload = { showDialog: payload, isTimerNeeded: true }
    }
    if (typeof payload.isTimerNeeded === "undefined") {
      payload.isTimerNeeded = true
    }
    if (state.callbackLoop > 0) {
      state.callbackLoop -= 1
    } else {
      if (!payload.showDialog) {
        Object.assign(state.loadingDialog, defaultLoadingState)
        if (state.timer) clearTimeout(state.timer)
        state.timer = null
      } else {
        Object.assign(state.loadingDialog, payload)
        state.loadingDialog.isLoading =
          payload.isLoading !== undefined ? payload.isLoading : true
      }
    }
  },
  resetTimer(state: RootState) {
    if (state.timer) clearTimeout(state.timer)
    state.timer = setTimeout(() => {
      if (state.loadingDialog.isLoading && state.loadingDialog.showDialog) {
        mutations.changeLoadingState(state, {
          showDialog: true,
          isLoading: false,
          isSuccess: false,
          showAction: true,
          error: "connectionError",
        })
      }
    }, 30000)
  },
  setDeviceIpList(state: RootState, payload: any[]) {
    state.deviceIpList = payload
    sessionStorage.setItem("deviceIpList", JSON.stringify(payload))
  },
  setCallbackLoop(state: RootState, payload: number) {
    state.callbackLoop = payload
  },
  setUserInfo(state: RootState, payload: Partial<UserInfo>) {
    Object.assign(state.userInfo, payload)
    state.userInfo.isAdmin = state.userInfo.roles.includes("admin")
    sessionStorage.setItem("userInfo", JSON.stringify(state.userInfo))
    sessionStorage.setItem("userName", state.userInfo.name)
    const tokenPayload: TokenPayload = {
      userInfo: state.userInfo ?? 0,
      userName: state.userInfo.name,
      deviceIpList: state.deviceIpList,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 例如設置一天後過期
    }
    localStorage.setItem("login_token", auth.createToken(tokenPayload))
  },
  removeUserInfo(state: RootState) {
    state.userInfo = { ...defaultUserInfo }
    sessionStorage.clear()
    localStorage.removeItem("login_token")
  },
  toggleSideNav(state: RootState) {
    state.layout.isSidenavShown = !state.layout.isSidenavShown
    localStorage.setItem("layout", JSON.stringify(state.layout))
  },
  changeDestination(state: RootState, payload: string) {
    state.destination = payload
  },
}

const actions = {
  changeLanguage({ commit }: any, payload: string) {
    commit("changeLanguage", payload)
  },
  async getFloBookLicense({ commit }: any) {
    try {
      const res = await apiGetFloBookLicense()
      commit("updateFloBookLicense", res.data)
      return res.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
  setFloBookLicense({ commit }: any, payload: FloBookLicense) {
    commit("updateFloBookLicense", payload)
  },
  checkMobileAndTablet({ commit }: any) {
    commit("checkMobileAndTablet")
  },
  changeLoadingState(
    { commit }: any,
    payload: Partial<LoadingDialog> | boolean
  ) {
    commit("changeLoadingState", payload)
  },
  setDeviceIpList({ commit }: any, payload: any[]) {
    commit("setDeviceIpList", payload)
  },
  setCallbackLoop({ commit }: any, payload: number) {
    commit("setCallbackLoop", payload)
  },
  setUserInfo({ commit }: any, payload: Partial<UserInfo>) {
    commit("setUserInfo", payload)
  },
  removeUserInfo({ commit }: any) {
    commit("removeUserInfo")
  },
  toggleSideNav({ commit }: any) {
    commit("toggleSideNav")
  },
  changeDestination({ commit }: any, payload: string) {
    commit("changeDestination", payload)
  },
}

export default createStore({
  strict: import.meta.env.MODE !== "production",
  state,
  getters,
  mutations,
  actions,
})
