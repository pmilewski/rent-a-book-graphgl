const lunr = require("lunr");

function initBookIndex(db) {
    return lunr(function () {
        this.ref('id')
        this.field('title')
        this.field('description')

        db.getAllBooks().forEach(function (book) {
            this.add(book)
        }, this)
    })
}

function initUserIndex(db) {
    return lunr(function () {
        this.ref('id')
        this.field('name')
        this.field('info')

        db.getAllUsers().forEach(function (user) {
            this.add(user)
        }, this)
    })
}

function initAuthorIndex(db) {
    return lunr(function () {
        this.ref('id')
        this.field('name')
        this.field('bio')

        db.getAllAuthors().forEach(function (author) {
            this.add(author)
        }, this)
    })
}

class Search {
    constructor(db) {
        this.db = db;
        this.bookIndex = initBookIndex(db);
        this.userIndex = initUserIndex(db);
        this.authorIndex = initAuthorIndex(db);
    }

    findBooks(searchQuery) {
        const results = this.bookIndex.search(searchQuery)
        const foundIds = results.map(({ ref }) => ref)
        return foundIds.map(id => this.db.getBookById(id))
    }

    findUsers(searchQuery) {
        const results = this.userIndex.search(searchQuery)
        const foundIds = results.map(({ ref }) => ref)
        return foundIds.map(id => this.db.getUserById(id))
    }

    findAuthors(searchQuery) {
        const results = this.authorIndex.search(searchQuery)
        const foundIds = results.map(({ ref }) => ref)
        return foundIds.map(id => this.db.getAuthorById(id))
    }
}

module.exports = {
    Search
};