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

let timeOutId = 0

let currency 
let accounts 
let transactions 
let stats 


let funiter = {
    name: 'fÜne',
    logo: 'fї',
    uValue: 1000,
}

funiter.doTx = simpleTx => {
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
 * CURRENCY
 */

funiter.getCurrency = () => {
    return Object.assign({}, currency)
}

funiter.updateCurrency = newCurrency => {
    const { expression, stepTime, revaluationTime, mode, uPerDay } = newCurrency
    funiter.stop()
    Object.assign(currency, { expression, stepTime, revaluationTime, mode, uPerDay })
    funiter.play()
    return Object.assign({}, currency)
}


/* 
 * ACCOUNT
 */

funiter.getAccount = id => {
    return accounts[id]
}

funiter.getAccounts = () => {
    return Object.values(accounts)
}

funiter.createAccount = newAccount => {
    newAccount.name = newAccount.name.trim()
    if (!newAccount.name || accounts[newAccount.name]) 
        return null

    let account = accounts[newAccount.name] = Object.assign({name: '', balance: 0, role: 'wallet', date: new Date().toISOString(), creationDay: currency.elapsedTime}, newAccount)
    return account
}

funiter.updateAccount = (id, newAccount) => {
    let account = accounts[id]
    if (!account || account.role == 'bank' || (newAccount.name && id != newAccount.name)) 
        return null
    
    account = Object.assign(account, newAccount)
    return account
}

funiter.deleteAccount = id => {
    let account = accounts[id]
    if (!account || account.name == funiter.name) 
        return null

    delete accounts[id]
    delete stats[id]
    return account
}

funiter.getAccountTx = (id, limit) => {
    if (!accounts[id]) 
        return null

    let tx = transactions.filter(transaction => transaction.from == id || transaction.to == id)
    if (limit > 0 && limit < tx.length) 
        tx = tx.slice(-limit)
    
    return tx
}

funiter.getAccountStats = id => {
    if (!accounts[id]) 
        return null

    let stat = stats[id]
    if (!stat) 
        return []

    let index = (Math.floor(currency.elapsedTime / statPeriod) + 1) % statLimit
    return stat.slice(index).concat(stat.slice(0, index))
}



/* 
 * DB
 */

funiter.getState = () => {
    const state = {
        currency,
        accounts,
        transactions,
        stats,
    }
    return state
}


funiter.restoreState = state => {
    if (!state)
        return
    
    if (state.currency) 
        currency = state.currency
    if (state.accounts) 
        accounts = state.accounts
    if (state.transactions) 
        transactions = state.transactions
    if (state.stats) 
        stats = state.stats

}


funiter.start = (math, state) => {
    funiter.math = math
    funiter.restoreState(state)

    if (!currency)
        currency = {
            date: new Date().toISOString(),
            stepTime: 10,
            uPerDay: 1,
            elapsedTime: 0,
            revaluationTime: 1, 
            nbMembers: 0,
            monetaryMass: 0,
            mode: modes.melt,
            lastMelt: 0,
            expression: '10/100'
        }

    if (!accounts) 
        accounts = {}

    accounts[funiter.name] = {name: funiter.name, balance: 0, role: roles.bank, date: new Date().toISOString(), creationDay: 0}

    if (!transactions)
        transactions = []

    if (!stats) 
        stats = {}

    if (!stats[funiter.name])
        stats[funiter.name] = new Array(statLimit).fill(0)

    funiter.play()
}


funiter.onDayChange = () => {
    // nothing
}

const cheatRegex = /!x(\d+)/
const uValue = funiter.uValue
const revaluationMessage = '!revaluation%'
const creationMessage = '!1Ucreation'

funiter.play = () => {
    currency.elapsedTime++
    
    let monetaryMass = 0
    let nbMembers = 0
    let meltValue = 0
    let meltPercent = 0
    
    const uPerDay = currency.uPerDay ? Math.floor(currency.uPerDay) : 1
    const uGained = uValue * currency.revaluationTime * uPerDay
    const funiterAccount = accounts[funiter.name]
    const isStatDay = currency.elapsedTime % statPeriod == 0
    const statIndex = isStatDay ? Math.floor(currency.elapsedTime / statPeriod) % statLimit : 0 
    const isRevaluation = currency.elapsedTime % currency.revaluationTime == 0

    if (isRevaluation && currency.nbMembers > 0) {
        meltValue = funiter.math.evaluate(currency.expression, {M: currency.monetaryMass / uGained, N: currency.nbMembers, T: currency.elapsedTime})
        if (currency.mode == modes.grew) 
            meltValue = 1 - 1 / (1 + meltValue)
        meltValue = Math.max(0, Math.min(1, meltValue))
        meltPercent = (meltValue * 100).toFixed(2)
    }

    Object.values(accounts).forEach(account => {
        const cheat = account.name.match(cheatRegex)
        let weight = 1
        if (cheat)
            weight = parseInt(cheat[1]) 

        if (isRevaluation && meltValue > 0) {
            let melting = account.balance * meltValue
            melting = Math.min(melting > uGained ? Math.ceil(melting) : Math.floor(melting), account.balance)
            funiter.doTx({from: account.name, to: funiterAccount.name, message: revaluationMessage + meltPercent, value: melting})
        }    
        if (account.role == roles.human) {
            nbMembers += weight
            funiter.doTx({from: funiterAccount.name, to: account.name, message: creationMessage, value: uValue * uPerDay})
        }
        monetaryMass += account.balance * weight
        if (isStatDay && account.role != roles.bank) {
            let stat = stats[account.name]
            if (!stat) {
                stat = stats[account.name] = new Array(statLimit).fill(0)
            }
            stat[statIndex] = account.balance 
        }
    });

    currency.nbMembers = nbMembers
    currency.monetaryMass = monetaryMass
    if (isStatDay)
        stats[funiter.name][statIndex] = nbMembers > 0 ? Math.floor(monetaryMass / nbMembers) : 0
    if (isRevaluation)
        currency.lastMelt = meltPercent
    
    timeOutId = setTimeout(funiter.play, currency.stepTime * 1000)

    funiter.onDayChange(currency.elapsedTime)
}


funiter.stop = () => {
    if (timeOutId != 0) {
        clearTimeout(timeOutId)
        timeOutId = 0
    }
}

export default funiter
