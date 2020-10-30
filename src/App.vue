<template>
  <div id="app">
  <dropzone v-bind:dropzone="dropzone" /> 
  </div>
</template>

<script>

import dropzone from './components/dropzone';

export default {
  name: 'app',

  components: {
    dropzone
  },

  data() {
    return {
      dropzone: {}
    }
  }
}
</script>

<style>


* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Roboto, sans-serif;
  line-height: 1.4;
  font-weight: 100;
  color: #f4f4f4;
}

h1 {
  text-align: center;
  margin-top: 20px;
  color: #f4f4f4;
  font-size: 5em;
}

</style>
