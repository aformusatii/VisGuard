import sqlite3 from 'sqlite3';

export default class SQLite3 {

    constructor(path) {
        this.db = null
        this.path = path
    }

    async open() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.path, function (err) {
                if (err) reject(err)
                else resolve(this.path + " opened")
            })
        })
    }

    async run(query, params) {
        return new Promise((resolve, reject) => {
            if (params == undefined) params = []

            this.db.run(query, params, function (err) {
                if (err) reject(err)
                else resolve(this)
            })
        })
    }

    async get(query, params) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, function (err, row) {
                if (err) reject(err)
                else resolve(row)
            })
        })
    }

    async all(query, params) {
        return new Promise((resolve, reject) => {
            if (params == undefined) params = []

            this.db.all(query, params, function (err, rows) {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }

    async each(query, params, action) {
        return new Promise((resolve, reject) => {
            var db = this.db
            db.serialize(function () {
                db.each(query, params, function (err, row) {
                    if (err) reject(err)
                    else {
                        if (row) {
                            action(row)
                        }
                    }
                })
                resolve(true)
            })
        })
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.db.close(function (err) {
                if (err) reject(err)
                else resolve(true)
            })
        })
    }
}