<template>
  <div class="ad">
    <h2>
      {{ $t("light.more-features") }}
      <p class="contact" v-html="$t('common.cae-support')"></p>
    </h2>
    <img src="@/assets/images/light/detail.png" alt="Monitor Detail Demo" />
    <img src="@/assets/images/light/detail2.png" alt="Hardware History Demo" />
    <img src="@/assets/images/light/detail3.png" alt="License History Demo" />
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.ad {
  padding-bottom: 60px;
}
.ad img {
  width: 1000px;
  margin-bottom: 30px;
}
.contact {
  color: deepskyblue;
  margin: 20px 0;
  font-size: inherit;
}
</style>
