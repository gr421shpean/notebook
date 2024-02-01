<!--Создаем компонент Column1.vue, который отображает карточки первого столбца.-->
<!--Используем входной параметр cards, который содержит массив карточек первого столбца.-->
<!--Рендерим каждую карточку и добавляем кнопку для удаления карточки. -->
<!--Когда пользователь нажимает на кнопку "Add Card", вызывается метод addCard и передается новая -->
<!--карточка через событие addCard. При нажатии кнопки "Delete Card" вызывается -->
<!--метод deleteCard и передается индекс карточки, которую нужно удалить, через событие deleteCard.-->


<template>
  <div class="column">
    <h2>Column 1</h2>
    <div class="card-container">
      <div v-for="(card, index) in cards" :key="index" class="card">
        <h3>{{ card.title }}</h3>
        <ul>
          <li v-for="(item, itemIndex) in card.items" :key="itemIndex" :class="{ completed: item.completed }">{{ item.text }}</li>
        </ul>
        <button @click="deleteCard(index)">Delete Card</button>
      </div>
    </div>
    <button @click="addCard">Add Card</button>
  </div>
</template>

<script>
export default {
  name: 'Column1',
  props: {
    cards: {
      type: Array,
      required: true
    }
  },
  methods: {
    addCard() {
      const newCard = {
        title: 'New Card',
        items: []
      }
      this.$emit('addCard', newCard)
    },
    deleteCard(cardIndex) {
      this.$emit('deleteCard', cardIndex)
    }
  }
}
</script>