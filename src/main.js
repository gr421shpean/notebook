Vue.component('columns', {
    template: `
      <div class="columns">
      <column title="Новые" :cards="newColumn" @add-card="addCard('newColumn', $event)" @delete-card="deleteCard('newColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></column>
      <column title="В процессе" :cards="inProgressColumn" @delete-card="deleteCard('inProgressColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted" @lock-first-column="lockFirstColumn"></column>
      <column title="Выполненные" :cards="completedColumn" @delete-card="deleteCard('completedColumn', $event)" @save-local-storage="saveToLocalStorage"></column>
      </div>
    `,
    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('todo-columns'));
        if (data) {
            this.newColumn = data.newColumn || [];
            this.inProgressColumn = data.inProgressColumn || [];
            this.completedColumn = data.completedColumn || [];
            // Установка состояния чекбоксов
            this.newColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
            this.inProgressColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
            this.completedColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
        }
    },
    getColumnTitle(column) {
        switch (column) {
            case 'newColumn':
                return 'Новые';
            case 'inProgressColumn':
                return 'В процессе';
            case 'completedColumn':
                return 'Выполненные';
            default:
                return '';
        }
    }
});
Vue.component('column', {
    props: ['title', 'cards'],
    template: `
      <div class="column">
      <h2>{{ title }}</h2>
      <card v-for="(card, index) in cards" :key="index" :card="card" @delete-card="deleteCard(index)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></card>
      <form action="" v-if="title === 'Новые'">
        <input type="text" v-model="customTitle">
        <button v-if="title === 'Новые'" @click="addCardWithCustomTitle">Добавить заметку</button>
      </form>
      </div>
    `,

    data() {
        return {
            customTitle: ''
        };
    },
    methods: {
        deleteCard(cardIndex) {
            this.$emit('delete-card', cardIndex);
        },
       
        addCardWithCustomTitle() {
            if (this.customTitle) {
                this.$emit('add-card', this.customTitle);
            }
        },
        saveToLocalStorage() {
            this.$emit('save-local-storage');
        },
        moveCardToInProgress(card) {
            this.$emit('move-card-to-in-progress', card);
        },
        moveCardToCompleted(card) {
            this.$emit('move-card-to-completed', card);
        }
    }
});
new Vue({
    el: '#app',
    data() {
        return {
            newColumn: [],
            inProgressColumn: [],
            completedColumn: [],
            isFirstColumnLocked: false
        }
    },
    created() {
        this.loadFromLocalStorage();
    },
    methods: {
        deleteCard(column, cardIndex) {
            this[column].splice(cardIndex, 1);
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('todo-columns', JSON.stringify({
                newColumn: this.newColumn,
                inProgressColumn: this.inProgressColumn,
                completedColumn: this.completedColumn
            }));
        },
        loadFromLocalStorage() {
            const data = JSON.parse(localStorage.getItem('todo-columns'));
            if (data) {
                this.newColumn = data.newColumn || [];
                this.inProgressColumn = data.inProgressColumn || [];
                this.completedColumn = data.completedColumn || [];
                this.newColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.inProgressColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.completedColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
            }
        },
    }
});

