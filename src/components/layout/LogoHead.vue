<template>
  <div class="logo-head">
    <router-link to="/Home">
      <div class="img"></div>
    </router-link>
  </div>
</template>

<script setup>
// 不需要額外邏輯，因此這裡保持空白
</script>

<style scoped>
.logo-head {
  margin-top: 60px;
}
.logo-head .img {
  background-image: url("/img/Home/logo-flobook.png");
  width: 50vw;
  height: 80px;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  margin: auto;
}
</style>
