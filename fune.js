var pjson = require('./package.json')
const express = require('express')
const morgan = require('morgan')
const storage = require('node-persist')
const mathParser = require('mathjs') 

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('tiny'))

const txLimit = 1000
const statLimit = 100
const statPeriod = 1

const roles = {
    human: 'human',
    wallet: 'wallet',
    bank: 'bank'
}

const modes = {
    grew: 'grew',
    melt: 'melt'
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
        || accountFrom == accountTo
        || accountFrom.role != roles.bank && (accountFrom.balance - tx.value < 0))
        return null
    if (accountTo.role != roles.bank)
        accountTo.balance += tx.value
    if (accountFrom.role != roles.bank) {
        accountFrom.balance -= tx.value
        if (accountFrom.balance < 5) {
            accountFrom.balance = 0
        }
    }
    tx.balanceFrom = accountFrom.balance
    tx.balanceTo = accountTo.balance
    transactions.push(tx)
    if (transactions.length > txLimit) 
        transactions = transactions.slice(transactions.length - txLimit)
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
    req.body.name = req.body.name.trim()
    if (req.body.name && !accounts[req.body.name]) {
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
    if (account && account.name != fune.name) {
        delete accounts[id]
        delete stats[id]
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
    let tx = doTx(req.body)
    if (!tx)
        res.status(400).send()
    else {
        await storage.setItem('accounts', accounts)
        await storage.setItem('transactions', transactions)
        res.status(201).json(tx) 
    }
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
    if (req.body.currency) {
        currency = req.body.currency
        await storage.setItem('currency', currency)
    }
    if (req.body.accounts) {
        accounts = req.body.accounts
        await storage.setItem('accounts', accounts)
    }
    if (req.body.transactions) {
        transactions = req.body.transactions
        await storage.setItem('transactions', transactions)
    }
    if (req.body.stats) {
        stats = req.body.stats
        await storage.setItem('stats', stats)
    }
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
            stepTime: 10,
            elapsedTime: 0,
            revaluationTime: 1, 
            playing: true,
            nbMembers: 0,
            monetaryMass: 0,
            mode: modes.melt,
            lastMelt: 0,
            expression: '10/100'
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
    if (currency.playing) {
        const uValue = 1000
        const uGained = uValue * currency.revaluationTime
        currency.elapsedTime++
        const funeAccount = accounts[fune.name]
        let m = 0
        let n = 0
        const isRevaluation = currency.elapsedTime % currency.revaluationTime == 0
        let meltValue = 0
        let meltPercent = 0

        if (isRevaluation && currency.nbMembers > 0) {
            meltValue = mathParser.evaluate(currency.expression, {M: currency.monetaryMass / uValue, N: currency.nbMembers})
            if (currency.mode == modes.grew) 
                meltValue = 1 - 1 / (1 + meltValue)
            meltValue = Math.max(0, Math.min(1, meltValue))
            meltPercent = (meltValue * 100).toFixed(2)
        }

        Object.values(accounts).forEach(account => {
            if (isRevaluation && meltValue > 0) {
                let melting = account.balance * meltValue
                melting = Math.min(melting > uGained ? Math.ceil(melting) : Math.floor(melting), account.balance)
                doTx({from: account.name, to: funeAccount.name, message: '!revaluation%' + meltPercent, value: melting})
            }    
            if (account.role == roles.human) {
                n++
                doTx({from: funeAccount.name, to: account.name, message: '!1Ucreation', value: uValue})
            }
            m += account.balance
            if (currency.elapsedTime  % statPeriod == 0 && account.role != roles.bank) {
                var stat = stats[account.name]
                if (!stat) {
                    stat = stats[account.name] = new Array(statLimit).fill(0)
                }
                let index = Math.round(currency.elapsedTime / statPeriod) % statLimit
                stat[index] = account.balance 
            }
        });

        currency.nbMembers = n
        currency.monetaryMass = m
        if (isRevaluation)
            currency.lastMelt = meltPercent

        await storage.setItem('stats', stats)
        await storage.setItem('accounts', accounts)
        await storage.setItem('currency', currency)

        console.log("Day " + currency.elapsedTime + " M: " + (m / uValue).toFixed(2) + " N: " + n)
        if (isRevaluation)
            console.log("Revaluation melting: " + meltPercent + "%")
    }
    setTimeout(play, currency.stepTime * 1000);
}


start();