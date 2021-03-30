var pjson = require('./package.json');
const express = require('express')
const morgan = require('morgan')
const storage = require('node-persist');

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('tiny'))

const txLimit = 1000
const statLimit = 100
const statPeriod = 1

const roles = {
    creator: 'creator',
    wallet: 'wallet',
    bank: 'bank'
}


let fune = {
    name: 'fÜne',
    logo: 'fї',
    version: pjson.version,
}

let currency = {}
let accounts = {}
let transactions = []
let ideas = {}
let stats = {}

const doTx = async (simpleTx) => {
    let tx = Object.assign({from: '', to: '', message: '', value: 0, date: new Date().toISOString(), day: currency.elapsedTime}, simpleTx)
    var accountFrom = accounts[tx.from]
    var accountTo = accounts[tx.to]
    if (tx.value <= 0 
        || !accountFrom
        || !accountTo
        || accountFrom.role != roles.bank && (accountFrom.balance - tx.value < 0))
        return null
    if (accountTo.role != roles.bank)
        accountTo.balance += tx.value
    if (accountFrom.role != roles.bank)
        accountFrom.balance -= tx.value
    tx.balanceFrom = accountFrom.balance
    tx.balanceTo = accountTo.balance
    transactions.push(tx)
    if (transactions.length > txLimit) 
        transactions = transactions.slice(transactions.length - txLimit)
    await storage.setItem('accounts', accounts)
    await storage.setItem('transactions', transactions)
    return tx
}

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
    if (currency.c < 0  || currency.c > 100) {
        res.status(400).send()
    } else {
        await storage.setItem('currency', currency)
        res.status(200).json(currency)
    }
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
        var account = accounts[req.body.name] = Object.assign({name: '', balance: 0, role: 'wallet', date: new Date().toISOString(), creationDay: currency.elapsedTime}, req.body)
        await storage.setItem('accounts', accounts)
        res.status(201).json(account)
    } else {
        res.status(400).send()
    }
})

app.patch('/accounts/:id', async (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    let patched = false
    if (account && account.role != 'bank') {
        account = Object.assign(account, req.body)
        await storage.setItem('accounts', accounts) 
        patched = true   
    }
    res.status(patched ? 200 : 404).json(account)
})

app.delete('/accounts/:id', async (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    let deleted = false
    if (account && account.role != 'bank') {
        delete accounts[id]
        await storage.setItem('accounts', accounts)
        deleted = true
    }
    res.status(deleted ? 204 : 404).send();
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
    let tx = await doTx(req.body)
    if (!tx)
        res.status(400).send()
    else 
        res.status(201).json(tx) 
})

app.get('/accounts/:id/stats', (req, res) => {
    const id = req.params.id
    var account = accounts[id]
    if (!account) {
        res.status(404).send()
    } else {
        let stat = stats[id]
        var result
        if (stat) {
            let index = (Math.floor(currency.elapsedTime / statPeriod) + 1) % statLimit
            result = stat.slice(index).concat(stat.slice(0, index))
        } else {
            result = []
        }
        res.status(200).json(result)
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
        transactions,
        stats,
    }
    res.status(200).json(db)
})


app.put('/db', async (req, res) => {
    currency = req.body.currency
    accounts = req.body.accounts
    transactions = req.body.transactions
    stats = req.body.stats
    await storage.setItem('currency', currency)
    await storage.setItem('accounts', accounts)
    await storage.setItem('transactions', transactions)
    await storage.setItem('stats', stats)
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
            revaluationTime: 1, 
            playing: true, 
        }


    accounts = await storage.getItem('accounts')

    if (!accounts) 
        accounts = {}

    accounts[fune.name] = {name: fune.name, balance: 0, role: roles.bank, date: new Date().toISOString(), creationDay: 0}

    ideas = {
        idea1: {name: 'idea1', account: 'alice', text: 'first idea', date: new Date().toISOString()},
    }

    transactions = await storage.getItem('transactions')

    if (!transactions)
        transactions = [];

    stats = await storage.getItem('stats')

    if (!stats) 
        stats = {}

    play()
}



async function play() {
    const uValue = 100
    const uGained = currency.revaluationTime * uValue
    if (currency.playing) {
        currency.elapsedTime++;
        const funeAccount = accounts[fune.name]
        Object.values(accounts).forEach( async account => {
            if (currency.c != 0 && currency.elapsedTime % currency.revaluationTime == 0) {
                let melting = account.balance * (currency.c / 100)
                if (melting > uGained) {
                    melting = Math.ceil(melting)
                } else {
                    melting = Math.floor(melting)
                }
                await doTx({from: account.name, to: funeAccount.name, message: '!revaluation%' + currency.c, value: melting})
            }    
            if (account.role == roles.creator)
                await doTx({from: funeAccount.name, to: account.name, message: '!1Ucreation', value: uValue})
            if (currency.elapsedTime  % statPeriod == 0) {
                var stat = stats[account.name]
                if (!stat) {
                    stat = stats[account.name] = new Array(statLimit).fill(0)
                }
                let index = Math.round(currency.elapsedTime / statPeriod) % statLimit
                stat[index] = account.balance 
            }
        });
        await storage.setItem('stats', stats)
        await storage.setItem('accounts', accounts)
        await storage.setItem('currency', currency)
        console.log("Day " + currency.elapsedTime)
    }
    setTimeout(play, currency.stepTime * 1000);
}


start();