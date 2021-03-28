var pjson = require('./package.json');
const express = require('express')
const morgan = require('morgan')
const storage = require('node-persist');

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('tiny'))


let fune = {
    name: 'fÜne',
    logo: 'fї',
    version: pjson.version
}

let currency = {}
let accounts = {}
let transactions = []
let ideas = {}


/*
 * ABOUT
 */

app.get('/fune', (req, res) => {
    res.status(200).json(fune)
})


/* 
 * CURRENCY
 */

app.get('/currency', (req, res) => {
    res.status(200).json(currency)
})

app.patch('/currency', async (req, res) => {
    currency = Object.assign(currency, req.body)
    await storage.setItem('currency', currency)
    res.status(200).json(currency)
})

/* 
 * ACCOUNT
 */

app.get('/accounts/:id', (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    res.status(account ? 200 : 404).json(account)
})

app.get('/accounts', (req, res) => {
    res.status(200).json(Object.values(accounts))
})

app.post('/accounts', async (req, res) => {
    if (req.body.name) {
        var account = accounts[req.body.name] = Object.assign({name: '', balance: 0, creator: false, date: new Date().toISOString(), creationDay: currency.elapsedTime}, req.body)
        await storage.setItem('accounts', accounts)
        res.status(201).json(account)
    } else {
        res.status(400).send()
    }
})

app.patch('/accounts/:id', async (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    if (account) {
        account = Object.assign(account, req.body)
        await storage.setItem('accounts', accounts)    
    }
    res.status(account ? 200 : 404).json(account)
})

app.delete('/accounts/:id', async (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    if (account) {
        delete accounts[id]
        await storage.setItem('accounts', accounts)
    }
    res.status(account ? 204 : 404).send();
})

app.get('/accounts/:id/tx', (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    if (!account) {
        res.status(404).send()
    } else {
        var tx = transactions.filter(transaction => transaction.from == id || transaction.to == id)
        if (req.query.limit) {
            const limit = parseInt(req.query.limit)
            tx = tx.slice(-req.query.limit)
        }
        res.status(200).json(tx)
    }
})

app.post('/tx', async (req, res) => {
    var tx = Object.assign({from: '', to: '', value: 0, date: new Date().toISOString(), day: currency.elapsedTime}, req.body)
    var accountFrom = accounts[tx.from]
    if (!accountFrom && tx.from == 'fÜne')
        accountFrom = { balance: tx.value }
    var accountTo = accounts[tx.to]
    if (!(accountFrom && accountTo && tx.value > 0 && accountFrom.balance - tx.value >= 0)) {
        res.status(400).send()
    } else {
        accountTo.balance += tx.value
        accountFrom.balance -= tx.value
        transactions.push(tx)
        res.status(201).json(tx)
        await storage.setItem('accounts', accounts)
        await storage.setItem('transactions', transactions)
    }
})

/* 
 * IDEA
 */

app.get('/ideas/:id', (req, res) => {
    const id = req.params.id
    var idea = ideas[id]
    res.status(idea ? 200 : 404).json(idea)
})

app.get('/ideas', (req, res) => {
    res.status(200).json(Object.values(ideas))
})

app.post('/ideas', (req, res) => {
    var idea = ideas[req.body.name] = Object.assign({name: '', text: '', account: '', date: new Date().toISOString()}, req.body)
    res.status(201).json(idea)
})

app.patch('/ideas/:id', (req, res) => {
    const id = req.params.id
    var idea = ideas[id]
    if (idea)
        idea = Object.assign(idea, req.body)
    res.status(idea ? 200 : 404).json(idea)
})

app.delete('/ideas/:id', (req, res) => {
    const id = req.params.id
    var idea = ideas[id]
    if (idea)
        delete ideas[id]
    res.status(idea ? 204 : 404).send();
})



/* 
 * DB
 */

app.get('/db', (req, res) => {
    const db = {
        currency,
        accounts,
        transactions
    }
    res.status(200).json(db)
})


app.put('/db', async (req, res) => {
    currency = req.body.currency
    accounts = req.body.accounts
    transactions = req.body.transactions
    await storage.setItem('currency', currency)
    await storage.setItem('accounts', accounts)
    await storage.setItem('transactions', transactions)
    res.status(204).send()
})

app.listen(80, () => {
    console.log("let the fÜne begin !!!")
})


async function start() {
    await storage.init({dir: 'db'})

    currency = await storage.getItem('currency')

    if (!currency)
        currency = {
            date: new Date().toISOString(),
            c: 10,
            stepTime: 60,
            elapsedTime: 0,
            revaluationTime: 30, 
            playing: true, 
        }


    accounts = await storage.getItem('accounts')

    if (!accounts)
        accounts = {
            alice: {name: 'alice', balance: 0, creator: true, date: new Date().toISOString(), creationDay: 0},
            bob: {name: 'bob', balance: 0, creator: true, date: new Date().toISOString(), creationDay: 0},
            claude: {name: 'claude', balance: 0, creator: true, date: new Date().toISOString(), creationDay: 0},
            daniel: {name: 'daniel', balance: 0, creator: false, date: new Date().toISOString(), creationDay: 0},
        }

    ideas = {
        idea1: {name: 'idea1', account: 'alice', text: 'first idea', date: new Date().toISOString()},
    }

    transactions = await storage.getItem('transactions')

    if (!transactions)
        transactions = [];

    play()
}



async function play() {
    if (currency.playing) {
        currency.elapsedTime++;
        Object.values(accounts).forEach( account => {
            if (currency.elapsedTime % currency.revaluationTime == 0)
                account.balance = Math.ceil(account.balance * (100 - currency.c) / 100);
            if (account.creator)
                account.balance += 100;
        });
        await storage.setItem('accounts', accounts)
        await storage.setItem('currency', currency)
    }
    setTimeout(play, currency.stepTime * 1000);
}


start();