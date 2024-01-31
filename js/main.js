const app = new Vue({
    el: '#app',
    data: {
        cardTitle: '',
        column1: [],
        column2: [],
        column3: []
    },
    mounted() {
        this.loadCards();
    },
    methods: {
        createCard() {
            if (this.cardTitle !== '') {
                const newCard = {
                    id: Date.now(),
                    title: this.cardTitle,
                    items: [
                        { id: 1, text: '', completed: false },
                        { id: 2, text: '', completed: false },
                        { id: 3, text: '', completed: false },
                        { id: 4, text: '', completed: false },
                        { id: 5, text: '', completed: false },
                    ],
                    completedItems: 0,
                    completedDate: ''
                };

                this.column1.push(newCard);
                this.cardTitle = '';
                this.saveCards();
            }
        },
        updateCardStatus() {
            this.column1.forEach(card => {
                const completedItems = card.items.filter(item => item.completed).length;
                const completionPercentage = (completedItems / card.items.length) * 100;

                if (completionPercentage >= 50) {
                    card.completedItems = completedItems;
                    this.column2.push(card);
                    this.column1 = this.column1.filter(c => c.id !== card.id);
                }
            });

            this.column2.forEach(card => {
                const completedItems = card.items.filter(item => item.completed).length;
                const completionPercentage = (completedItems / card.items.length) * 100;

                if (completionPercentage === 100) {
                    card.completedItems = completedItems;
                    card.completedDate = new Date().toLocaleString();
                    this.column3.push(card);
                    this.column2 = this.column2.filter(c => c.id !== card.id);
                }
            });

            this.saveCards();
        },
        loadCards() {
            const savedCards = JSON.parse(localStorage.getItem('cards'));

            if (savedCards) {
                this.column1 = savedCards.column1 || [];
                this.column2 = savedCards.column2 || [];
                this.column3 = savedCards.column3 || [];
            }
        },
        saveCards() {
            const cards = {
                column1: this.column1,
                column2: this.column2,
                column3: this.column3
            };

            localStorage.setItem('cards', JSON.stringify(cards));
        }
    },
    watch: {
        'column1': {
            handler() {
                this.updateCardStatus();
            },
            deep: true
        },
        'column2': {
            handler() {
                this.updateCardStatus();
            },
            deep: true
        }
    }
})