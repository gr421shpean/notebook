Vue.component('notes-item', {
    template: `
        <li>
            {{ title }}
            <button v-on:click="$emit('delete')">Удалить</button>
        </li>
    `,
    props: ['title']
});

Vue.component('columns', {
    template: `
        <div class="columns">
            <column title="Новые" :cards="newColumn" :locked="locked" @add-card="addCard('newColumn', $event)" @remove-card="deleteCard('newColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></column>
            <column title="В процессе" :cards="inProgressColumn" @remove-card="deleteCard('inProgressColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></column>
            <column title="Выполненные" :cards="completedColumn" @remove-card="deleteCard('completedColumn', $event)" @save-local-storage="saveToLocalStorage"></column>
        </div>
    `,
    data() {
        return {
            newColumn: [],
            inProgressColumn: [],
            completedColumn: [],
            maxCards: {
                newColumn: 3,
                inProgressColumn: 5,
                completedColumn: Infinity
            },
            locked: false
        }
    },
    created() {
        this.loadFromLocalStorage();
        this.checkLock();
    },
    methods: {
        addCard(column, customTitle) {
            const totalCards = this.newColumn.length + this.inProgressColumn.length + this.completedColumn.length;
            if (totalCards >= this.maxCards.newColumn + this.maxCards.inProgressColumn + this.maxCards.completedColumn) {
                alert(`Достигнуто максимальное количество карточек во всех столбцах.`);
                return;
            }
            if (this[column].length >= this.maxCards[column]) {
                alert(`Достигнуто максимальное количество карточек в столбце "${this.getColumnTitle(column)}".`);
                return;
            }
            if (column !== 'newColumn') {
                alert(`Можно добавлять заметки только в столбец "Новые".`);
                return;
            }

            if (this.inProgressColumn.length >= this.maxCards.inProgressColumn) {
                alert('Столбец "В процессе" уже содержит максимальное количество карточек.');
                return;
            }

            const newCard = {
                title: customTitle || 'Новая заметка',
                items: [
                    { text: '', completed: false, editing: true },
                    { text: '', completed: false, editing: true },
                    { text: '', completed: false, editing: true }
                ],
                status: 'Новые',
                locked: false
            };
            this[column].push(newCard);
            this.saveToLocalStorage();
        },
        deleteCard(column, cardIndex) {
            this[column].splice(cardIndex, 1);
            this.saveToLocalStorage();
            this.checkLock();
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
        },
        moveCardToInProgress(card) {
            const index = this.newColumn.indexOf(card);
            if (index !== -1) {
                if (this.inProgressColumn.length >= this.maxCards.inProgressColumn) {
                    alert('Столбец "В процессе" уже содержит максимальное количество карточек.');
                    return;
                }

                this.newColumn.splice(index, 1);
                this.inProgressColumn.push(card);
                this.saveToLocalStorage();
                this.checkLock();
            }
        },
        moveCardToCompleted(card) {
            const index = this.inProgressColumn.indexOf(card);
            if (index !== -1) {
                this.inProgressColumn.splice(index, 1);
                this.completedColumn.push(card);
                this.saveToLocalStorage();
            }

            this.checkLock();
        },
        checkLock() {
            if (this.inProgressColumn.length >= this.maxCards.inProgressColumn) {
                this.locked = true;
            } else {
                this.locked = false;
            }
            this.newColumn.forEach(card => card.locked = this.locked);
        }
    }
});

Vue.component('column', {
    props: ['title', 'cards', 'locked'],
    template: `

      <div class="column">
      <h2>{{ title }}</h2>

      <card v-for="(card, index) in cards" :key="index" :card="card" @delete-card="deleteCard(index)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></card>
      <form action="" v-if="title === 'Новые'">
        <input type="text" v-model="customTitle">
        <button v-if="title !== 'В процессе' && title !== 'В процессе'" @click="addCardWithCustomTitle" ref="new_card" v-bind:disabled="locked">Добавить заметку</button>
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

Vue.component('card', {
    props: ['card'],
    template: `
      <div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <input type="checkbox" v-model="item.completed" @change="saveToLocalStorage" :disabled="card.status === 'Выполненные' || card.locked"> 
          <input type="text" v-model="item.text" @input="saveToLocalStorage" :disabled="!item.editing || card.status !== 'Новые' || (card.status === 'В процессе') || card.locked">
<!--                    <button @click="saveItem(index)" v-if="item.editing && card.status !== 'Выполненные' && card.status !== 'В процессе' " :disabled="card.locked">Сохранить</button>-->
<!--          <button @click="editItem(index)" v-else-if="!item.editing && card.status !== 'Выполненные' && card.status !== 'В процессе' " :disabled="card.locked">Редактировать</button>-->
<!--          <label v-if="item.completed">Дата завершения: {{ item.completedDate ? item.completedDate : getFormattedDate()  }}</label>-->
          <button @click="deleteItem(index)" v-if="card.items.length > 3  && card.status !== 'Выполненные' " :disabled="card.locked">Удалить</button>
          
        </li>
                <li v-if="card.items.length < 5 && card.status === 'Новые'">
<!--                  <button class="add" @click="addItem"  :disabled="card.locked">Добавить пункт</button>-->
                </li>
      </ul>
      
      <!--      <button v-if="card.status !== 'Выполненные'" @click="deleteCard">Удалить заметку</button>-->
      <p class="card_status" v-if="card.status === 'Выполненные'">Дата завершения: {{ card.completionDate }}</p>
      </div>
    `,
    methods: {
        addItem() {
            if (this.card.items.length < 5 && this.card.items.length >= 3) {
                this.card.items.push({ text: '', completed: false, editing: true });
                this.saveToLocalStorage();
            } else {
                alert('Достигнуто максимальное количество пунктов или первый столбец заблокирован.');
            }
        },
        deleteItem(index) {
            if (this.card.items.length > 3 && !this.locked && this.card.status !== 'Выполненные') {
                this.card.items.splice(index, 1);
                this.saveToLocalStorage();
            }
        },
        deleteCard() {
            if (!this.locked && this.card.status !== 'Выполненные') {
                this.$emit('remove-card');
            } else {
                alert('Нельзя удалять карточки в столбце "Выполненные" или если первый столбец заблокирован.');
            }
        },
        saveItem(index) {
            if (this.card.status !== 'Выполненные' && !this.locked) {
                this.card.items[index].editing = false;
                this.saveToLocalStorage();
            }
        },
        editItem(index) {
            if (this.card.status !== 'Выполненные' && !this.locked) {
                this.card.items[index].editing = true;
            }
        },
        saveToLocalStorage() {
            this.checkCardStatus();
            this.$emit('save-local-storage');
        },
        getFormattedDate() {
            return new Date().toLocaleString();
        },
        updateCompletedDate(index) {
            if (this.card.items[index].completed) {
                this.card.items[index].completedDate = this.getFormattedDate();
            } else {
                this.card.items[index].completedDate = null;
            }
            this.saveToLocalStorage();
        },

        checkCardStatus() {
            const completedItems = this.card.items.filter(item => item.completed).length;
            const totalItems = this.card.items.length;
            const completionPercentage = (completedItems / totalItems) * 100;
            if (completionPercentage > 50 ) {
                this.card.status = 'В процессе';
                this.$emit('move-card-to-in-progress', this.card);
                if (completionPercentage >= 100) {
                    this.card.status = 'Выполненные';
                    this.card.completionDate = new Date().toLocaleString();
                    this.$emit('move-card-to-completed', this.card);
                }
            } else if (completionPercentage > 50 && this.card.status === 'Новые' && this.locked) {
            } else if (completionPercentage > 50 && this.card.status === 'Новые') {
                this.$emit('move-card-to-in-progress', this.card);
            } else if (completionPercentage === 100 && this.card.status === 'В процессе') {
            } else {
                this.card.status = 'Новые';
            }
        }
    },
    watch: {
        'card.items': {
            deep: true,
            handler() {
                this.saveToLocalStorage();
            }
        }
    },
});

new Vue({
    el: '#app',
    data() {
        return {
            newColumn: [],
            inProgressColumn: [],
            completedColumn: [],
            locked: false
        }
    },
    created() {
        this.loadFromLocalStorage();
    },
    methods: {
        removeCard(column, cardIndex) {
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