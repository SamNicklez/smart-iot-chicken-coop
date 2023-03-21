<script>
export default {
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
    /**
     * checks if the user is using a mobile device or not
     */
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
  },
}
</script>

<template>
  <div v-if="!isMobile()">
    Hello world
  </div>
  <div v-else style="background-color: rgb(52, 73, 85); padding: 20px;">
    Mobile sucks
  </div>
</template>

<style>
</style>
