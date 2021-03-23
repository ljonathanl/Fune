const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('tiny'))

var accounts = {
    alice: {name: 'alice', balance: 0, creator: false, date: new Date().toISOString()},
    bob: {name: 'bob', balance: 0, creator: false, date: new Date().toISOString()},
    claude: {name: 'claude', balance: 0, creator: false, date: new Date().toISOString()},
}

var ideas = {
    idea1: {name: 'idea1', account: 'alice', text: 'first idea', date: new Date().toISOString()},
}

var currency = {
    date: new Date().toISOString(),
    c: 0.1,
    stepTime: 1,
    elapsedTime: 0,
    revaluationTime: 30, 
    playing: true, 
}

var transactions = [];


function play() {
    if (currency.playing) {
        currency.elapsedTime++;
        Object.values(accounts).forEach( account => {
            if (currency.elapsedTime % currency.revaluationTime == 0)
                account.balance = Math.ceil(account.balance * (1 - currency.c));
            account.balance += 100;
        });
    }
    setTimeout(play, currency.stepTime * 1000);
}

/* 
 * CURRENCY
 */

app.get('/currency', (req, res) => {
    res.status(200).json(currency)
})

/* 
 * ACCOUNT
 */

app.get('/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id)
    var account = accounts[id]
    res.status(account ? 200 : 404).json(account)
})

app.get('/accounts', (req, res) => {
    res.status(200).json(Object.values(accounts))
})

app.post('/accounts', (req, res) => {
    var account = accounts[req.body.name] = Object.assign({name: '', balance: 0, creator: false, date: new Date().toISOString()}, req.body)
    res.status(201).json(account)
})

app.patch('/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id)
    var account = accounts[id]
    if (account)
        account = Object.assign(account, req.body)
    res.status(account ? 200 : 404).json(account)
})

app.delete('/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id)
    var account = accounts[id]
    if (account)
        delete accounts[id]
    res.status(account ? 204 : 404).send();
})

app.post('/tx', (req, res) => {
    var tx = Object.assign({from: '', to: '', value: 0, date: new Date().toISOString()}, req.body)
    var accountFrom = accounts[tx.from]
    var accountTo = accounts[tx.to]
    if (!(accountFrom && accountTo && tx.value > 0 && accountFrom.balance - tx.value > 0)) {
        res.status(account ? 204 : 404).send()
    } else {
        accountTo.balance += tx.value
        accountFrom.balance -= tx.value
        transactions.push(tx)
        res.status(201).json(tx)
    }
})

/* 
 * IDEA
 */

app.get('/ideas/:id', (req, res) => {
    const id = parseInt(req.params.id)
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
    const id = parseInt(req.params.id)
    var idea = ideas[id]
    if (idea)
        idea = Object.assign(idea, req.body)
    res.status(idea ? 200 : 404).json(idea)
})

app.delete('/ideas/:id', (req, res) => {
    const id = parseInt(req.params.id)
    var idea = ideas[id]
    if (idea)
        delete ideas[id]
    res.status(idea ? 204 : 404).send();
})




app.listen(80, () => {
    console.log("Let the Füne begin !!!")
})

play()
