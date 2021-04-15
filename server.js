import express from 'express'
import morgan from 'morgan'
import storage from 'node-persist'
import * as math from 'mathjs'
import funiter from './public/funiter.js'


const version = process.env.npm_package_version
const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('tiny'))

app.get('/standalone', function(req, res){
    res.sendFile('/public/standalone.html', { root: '.' });
});


/*
 * ABOUT
 */

app.get('/fune', (req, res) => {
    const { name, logo } = funiter
    res.status(200).json({ name, logo, version })
})


/* 
 * CURRENCY
 */

app.get('/currency', (req, res) => {
    res.status(200).json(funiter.getCurrency())
})

app.patch('/currency', async (req, res) => {
    currency = funiter.updateCurrency(req.body)
    res.status(200).json(currency)
})

/* 
 * ACCOUNT
 */

app.get('/accounts/:id', (req, res) => {
    const id = req.params.id
    const account = funiter.getAccount(id)
    res.status(account ? 200 : 404).json(account)
})

app.get('/accounts', (req, res) => {
    res.status(200).json(funiter.getAccounts())
})

app.post('/accounts', async (req, res) => {
    let account = funiter.createAccount(req.body)
    if (account) {
        res.status(201).json(account)
    } else {
        res.status(400).send()
    }
})

app.patch('/accounts/:id', async (req, res) => {
    let account = funiter.updateAccount(req.params.id, req.body)
    res.status(account ? 200 : 400).json(account)
})

app.delete('/accounts/:id', async (req, res) => {
    let account = funiter.deleteAccount(req.params.id)
    res.status(account ? 204 : 404).send();
})

app.get('/accounts/:id/tx', (req, res) => {
    let tx = funiter.getAccountTx(req.params.id, req.query.limit)
    if (!tx) {
        res.status(404).send()
    } else {
        res.status(200).json(tx)
    }
})

app.post('/tx', async (req, res) => {
    let tx = funiter.doTx(req.body)
    if (!tx)
        res.status(400).send()
    else {
        res.status(201).json(tx) 
    }
})

app.get('/accounts/:id/stats', (req, res) => {
    let stats = funiter.getAccountStats(req.params.id)
    if (!stats) {
        res.status(404).send()
    } else {
        res.status(200).json(stats)
    }
})


/* 
 * DB
 */

app.get('/db', (req, res) => {
    res.status(200).json(funiter.getState())
})


app.put('/db', async (req, res) => {
    funiner.restoreState(req.body)
    res.status(204).send()
})


async function start() {
    await storage.init({dir: 'db'})

    funiter.onDayChange = async d => {
        await storage.setItem('state', funiter.getState())
        const currency = funiter.getCurrency()

        console.log("Day " + currency.elapsedTime + " M: " + (currency.monetaryMass / funiter.uValue).toFixed(2) + " N: " + currency.nbMembers)
    }

    const state = await storage.getItem('state')
    funiter.start(math, state)
    funiter.play()
}


app.listen(80, () => {
    console.log("let the fÜne begin !!!")
})

start();