<template>
  <mu-container>
    <h1>Track</h1>
    <router-link :to="{ name: 'Knowledge Database' }">
      <div class="big-button">Knowledge Database</div>
    </router-link>
    <router-link v-if="versionOption.beta" :to="{ name: 'Team Statistic' }">
      <div class="big-button">Statistic - Team</div>
    </router-link>
    <router-link v-if="versionOption.beta" :to="{ name: 'Personal Statistic' }">
      <div class="big-button">Statistic - Personal</div>
    </router-link>
  </mu-container>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "home",
  components: {},
  data() {
    return {
      showDialog: false,
    }
  },
  computed: {
    ...mapGetters(["versionOption"]),
  },
  methods: {
    commingSoon() {
      this.showDialog = true
    },
  },
}
</script>

<style scoped>
h1 {
  margin: 5px;
  font-size: 52px;
}
.big-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 13vh;
  margin: auto;
  margin-bottom: 20px;
  cursor: pointer;
  background-color: #333;
  font-size: 40px;
  border-radius: 20px;
}
</style>
