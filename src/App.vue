
<template>
  <div class="app">
    <column1 :cards="column1Cards" @addCard="addCardToColumn1" @deleteCard="deleteCardFromColumn1"></column1>
    <column2 :cards="column2Cards" @addCard="addCardToColumn2" @deleteCard="deleteCardFromColumn2"></column2>
    <column3 :cards="column3Cards" @addCard="addCardToColumn3" @deleteCard="deleteCardFromColumn3"></column3>
  </div>
</template>

<script>
import Column1 from './components/Column1.vue'
import Column2 from './components/Column2.vue'
import Column3 from './components/Column3.vue'

export default {
  name: 'App',
  components: {
    Column1,
    Column2,
    Column3
  },
  data() {
    return {
      column1Cards: [],
      column2Cards: [],
      column3Cards: []
    }
  },
