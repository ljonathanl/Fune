const txLimit = 1000
const statLimit = 100
const statDayPeriod = 1
const statMonthPeriod = 60
const statYearPeriod = 360

const roles = {
    human: 'human',
    wallet: 'wallet',
    bank: 'bank'
}

const modes = {
    grew: 'grew',
    melt: 'melt'
}

const statTypes = {
    day: 'day',
    month: 'month',
    year: 'year'
}

const statPeriods = {
    day: 1,
    month: 60,
    year: 360
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
    isPlaying: false,
}

funiter.doTx = simpleTx => {
    let tx = Object.assign({from: '', to: '', message: '', value: 0, date: new Date().toISOString(), day: currency.elapsedTime}, simpleTx)
    var accountFrom = accounts[tx.from]
    var accountTo = accounts[tx.to]
    if (tx.value <= 0 
        || !accountFrom
        || !accountTo
        || accountFrom == accountTo
        || (accountFrom.role != roles.bank && (accountFrom.balance - tx.value < 0)))
        return null
    if (accountTo.role != roles.bank)
        accountTo.balance += tx.value
    if (accountFrom.role != roles.bank) {
        accountFrom.balance -= tx.value
        if (accountFrom.balance < 10) {
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
    const isPlaying = funiter.isPlaying
    const { expression, stepTime, revaluationTime, mode, uPerDay } = newCurrency
    if (isPlaying)
        funiter.stop()
    Object.assign(currency, { expression, stepTime, revaluationTime, mode, uPerDay })
    if (isPlaying)
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

funiter.getAccountStats = (id, period = statTypes.day) => {
    period = statTypes[period]
    if (!period)
        period = statTypes.day

    if (!accounts[id]) 
        return null

    const statAccount = stats[id]
    if (!statAccount) 
        return []

    const stat = statAccount[period]
    if (!stat)
        return []

    
    let index = (Math.floor(currency.elapsedTime / statPeriods[period]) + 1) % statLimit
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

const defaultCurrency = {
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


funiter.restoreState = state => {
    if (!state)
        return
    
    if (state.currency) 
        currency = Object.assign(defaultCurrency, state.currency)
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
        currency = defaultCurrency

    if (!accounts) 
        accounts = {}

    accounts[funiter.name] = {name: funiter.name, balance: 0, role: roles.bank, date: new Date().toISOString(), creationDay: 0}

    if (!transactions)
        transactions = []

    if (!stats) 
        stats = {}

    if (!stats[funiter.name]) {
        const stat = {}
        stat[statTypes.day] = new Array(statLimit).fill(0)
        stat[statTypes.month] = new Array(statLimit).fill(0)
        stat[statTypes.year] = new Array(statLimit).fill(0)
        stats[funiter.name] = stat
    }
        
}


funiter.onDayChange = () => {
    // nothing
}

const cheatRegex = /!x(\d+)/
const uValue = funiter.uValue
const revaluationMessage = '!revaluation%'
const creationMessage = '!1Ucreation'

const play = () => {
    currency.elapsedTime++
    
    let monetaryMass = 0
    let nbMembers = 0
    let meltValue = 0
    let meltPercent = 0
    
    const uPerDay = currency.uPerDay ? Math.floor(currency.uPerDay) : 1
    const uGained = uValue * currency.revaluationTime * uPerDay
    const funiterAccount = accounts[funiter.name]
    
    const isStatMonth = currency.elapsedTime % statPeriods.month == 0
    const isStatYear = currency.elapsedTime % statPeriods.year == 0
    const statDayIndex = currency.elapsedTime % statLimit
    const statMonthIndex = isStatMonth ? (currency.elapsedTime / statPeriods.month) % statLimit : 0 
    const statYearIndex = isStatYear ? (currency.elapsedTime / statPeriods.year) % statLimit : 0 

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
        if (account.role != roles.bank) {
            let stat = stats[account.name]
            if (!stat) {
                stat = {}
                stat[statTypes.day] = new Array(statLimit).fill(0)
                stat[statTypes.month] = new Array(statLimit).fill(0)
                stat[statTypes.year] = new Array(statLimit).fill(0)
                stats[account.name] = stat
            }
            stat[statTypes.day][statDayIndex] = account.balance
            if (isStatMonth) 
                stat[statTypes.month][statMonthIndex] = account.balance
            if (isStatYear) 
                stat[statTypes.year][statYearIndex] = account.balance    
        }
    });

    currency.nbMembers = nbMembers
    currency.monetaryMass = monetaryMass
    currency.average = nbMembers > 0 ? Math.floor(monetaryMass / nbMembers) : 0
    let statFuniter = stats[funiter.name]
    statFuniter[statTypes.day][statDayIndex] = currency.average
    if (isStatMonth) 
        statFuniter[statTypes.month][statMonthIndex] = currency.average
    if (isStatYear) 
        statFuniter[statTypes.year][statYearIndex] = currency.average


    if (isRevaluation)
        currency.lastMelt = meltPercent
    
    timeOutId = setTimeout(play, currency.stepTime * 1000)

    funiter.onDayChange(currency.elapsedTime)
}

funiter.reset = () => {
    funiter.stop()
    Object.values(accounts).forEach(account => {
        account.balance = 0
        if (account.role == roles.human)
            account.role = roles.wallet
        const stat = stats[account.name]
        stat[statTypes.day] = new Array(statLimit).fill(0)
        stat[statTypes.month] = new Array(statLimit).fill(0)
        stat[statTypes.year] = new Array(statLimit).fill(0)
    })
    transactions = []
    currency.elapsedTime = 0
    currency.lastMelt = 0
    currency.monetaryMass = 0
    currency.nbMembers = 0
}

funiter.play = () => {
    if (!funiter.isPlaying) {
        if (timeOutId != 0) {
            clearTimeout(timeOutId)
            timeOutId = 0
        }
        funiter.isPlaying = true
        play()
    }
}



funiter.stop = () => {
    if (funiter.isPlaying) {
        if (timeOutId != 0) {
            clearTimeout(timeOutId)
            timeOutId = 0
        }
        funiter.isPlaying = false
    }
}

export default funiter
