import { defineStore } from "pinia"

export const useLayoutStore = defineStore("layout", {
  state: () => ({
    isSidenavShown: true,
    sidenavWidth: 280,
  }),
  actions: {
    toggleSidenav() {
      this.isSidenavShown = !this.isSidenavShown
    },
    setSidenavShown(value: boolean) {
      this.isSidenavShown = value
    },
  },
})
