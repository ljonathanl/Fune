const txLimit = 1000
const statLimit = 100

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

let state = {}


const funiter = {
    name: 'fÜne',
    logo: 'fї',
    uValue: 1000,
    isPlaying: false,
}

funiter.doTx = simpleTx => {
    let tx = Object.assign({from: '', to: '', message: '', value: 0, date: new Date().toISOString(), day: state.currency.elapsedTime}, simpleTx)
    var accountFrom = state.accounts[tx.from]
    var accountTo = state.accounts[tx.to]
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
    state.transactions.push(tx)
    if (state.transactions.length > txLimit) 
        state.transactions = state.transactions.slice(state.transactions.length - txLimit)
    return tx
}


/* 
 * CURRENCY
 */

funiter.getCurrency = () => {
    return Object.assign({}, state.currency)
}

funiter.updateCurrency = newCurrency => {
    const isPlaying = funiter.isPlaying
    if (isPlaying)
        funiter.stop()
    Object.assign(state.currency, newCurrency)
    if (isPlaying)
        funiter.play()
    return Object.assign({}, state.currency)
}


/* 
 * ACCOUNT
 */

funiter.getAccount = id => {
    return state.accounts[id]
}

funiter.getAccounts = () => {
    return Object.values(state.accounts)
}

funiter.createAccount = newAccount => {
    newAccount.name = newAccount.name.trim()
    if (!newAccount.name || state.accounts[newAccount.name]) 
        return null

    let account = state.accounts[newAccount.name] = Object.assign({name: '', balance: 0, role: 'wallet', date: new Date().toISOString(), creationDay: state.currency.elapsedTime}, newAccount)
    return account
}

funiter.updateAccount = (id, newAccount) => {
    let account = state.accounts[id]
    if (!account || account.role == 'bank' || (newAccount.name && id != newAccount.name)) 
        return null
    
    account = Object.assign(account, newAccount)
    return account
}

funiter.deleteAccount = id => {
    let account = state.accounts[id]
    if (!account || account.name == funiter.name) 
        return null

    delete state.accounts[id]
    delete state.stats[id]
    return account
}

funiter.getAccountTx = (id, limit) => {
    if (!state.accounts[id]) 
        return null

    let tx = state.transactions.filter(transaction => transaction.from == id || transaction.to == id)
    if (limit > 0 && limit < tx.length) 
        tx = tx.slice(-limit)
    
    return tx
}

funiter.getAccountStats = (id, period = statTypes.day) => {
    period = statTypes[period]
    if (!period)
        period = statTypes.day

    if (!state.accounts[id]) 
        return null

    const statAccount = state.stats[id]
    if (!statAccount) 
        return []

    const stat = statAccount[period]
    if (!stat)
        return []

    
    let index = (Math.floor(state.currency.elapsedTime / statPeriods[period]) + 1) % statLimit
    return stat.slice(index).concat(stat.slice(0, index))
}



/* 
 * DB
 */

funiter.getState = () => {
    const state = {
        currency: state.currency,
        accounts: state.accounts,
        transactions: state.transactions,
        stats: state.stats,
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
        state.currency = Object.assign(defaultCurrency, state.currency)
    if (state.accounts) 
        state.accounts = state.accounts
    if (state.transactions) 
        state.transactions = state.transactions
    if (state.stats) 
        state.stats = state.stats

}

funiter.expressionParser = (expression, values) => {
    return parseFloat(expression)
}


funiter.start = (expressionParser, initialState) => {
    state = initialState
    if (expressionParser)
        funiter.expressionParser = expressionParser
    // funiter.restoreState(state)

    if (!state.currency)
        state.currency = defaultCurrency

    if (!state.accounts) 
        state.accounts = {}

    state.accounts[funiter.name] = {name: funiter.name, balance: 0, role: roles.bank, date: new Date().toISOString(), creationDay: 0}

    if (!state.transactions)
        state.transactions = []

    if (!state.stats) 
        state.stats = {}

    if (!state.stats[funiter.name]) {
        const stat = {}
        stat[statTypes.day] = new Array(statLimit).fill(0)
        stat[statTypes.month] = new Array(statLimit).fill(0)
        stat[statTypes.year] = new Array(statLimit).fill(0)
        state.stats[funiter.name] = stat
    }
        
}


funiter.onDayChange = () => {
    // nothing
}

const cheatRegex = /!x(\d+)/
const uValue = funiter.uValue
const revaluationMessage = '!revaluation%'
const creationMessage = '!1Ucreation'

const play = (autoPlay = true) => {
    state.currency.elapsedTime++
    
    let monetaryMass = 0
    let nbMembers = 0
    let meltValue = 0
    let meltPercent = 0
    
    const uPerDay = state.currency.uPerDay >= 0 ? Math.floor(state.currency.uPerDay) : 0
    const uGained = uValue * state.currency.revaluationTime * uPerDay
    const funiterAccount = state.accounts[funiter.name]
    
    const isStatMonth = state.currency.elapsedTime % statPeriods.month == 0
    const isStatYear = state.currency.elapsedTime % statPeriods.year == 0
    const statDayIndex = state.currency.elapsedTime % statLimit
    const statMonthIndex = isStatMonth ? (state.currency.elapsedTime / statPeriods.month) % statLimit : 0 
    const statYearIndex = isStatYear ? (state.currency.elapsedTime / statPeriods.year) % statLimit : 0 

    const isRevaluation = state.currency.elapsedTime % state.currency.revaluationTime == 0

    if (isRevaluation && state.currency.nbMembers > 0) {
        meltValue = funiter.expressionParser(state.currency.expression, {M: state.currency.monetaryMass / uGained, N: state.currency.nbMembers, T: state.currency.elapsedTime})
        if (state.currency.mode == modes.grew) 
            meltValue = 1 - 1 / (1 + meltValue)
        meltValue = Math.max(0, Math.min(1, meltValue))
        meltPercent = (meltValue * 100).toFixed(2)
    }

    Object.values(state.accounts).forEach(account => {
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
            let stat = state.stats[account.name]
            if (!stat) {
                stat = {}
                stat[statTypes.day] = new Array(statLimit).fill(0)
                stat[statTypes.month] = new Array(statLimit).fill(0)
                stat[statTypes.year] = new Array(statLimit).fill(0)
                state.stats[account.name] = stat
            }
            stat[statTypes.day][statDayIndex] = account.balance
            if (isStatMonth) 
                stat[statTypes.month][statMonthIndex] = account.balance
            if (isStatYear) 
                stat[statTypes.year][statYearIndex] = account.balance    
        }
    });

    state.currency.nbMembers = nbMembers
    state.currency.monetaryMass = monetaryMass
    state.currency.average = nbMembers > 0 ? Math.floor(monetaryMass / nbMembers) : 0
    let statFuniter = state.stats[funiter.name]
    statFuniter[statTypes.day][statDayIndex] = state.currency.average
    if (isStatMonth) 
        statFuniter[statTypes.month][statMonthIndex] = state.currency.average
    if (isStatYear) 
        statFuniter[statTypes.year][statYearIndex] = state.currency.average


    if (isRevaluation)
        state.currency.lastMelt = meltPercent
    
    if (autoPlay)
        timeOutId = setTimeout(play, state.currency.stepTime * 1000, true)

    funiter.onDayChange(state.currency.elapsedTime)
}

funiter.reset = () => {
    funiter.stop()
    Object.values(state.accounts).forEach(account => {
        account.balance = 0
        if (account.role == roles.human)
            account.role = roles.wallet
        const stat = {}
        stat[statTypes.day] = new Array(statLimit).fill(0)
        stat[statTypes.month] = new Array(statLimit).fill(0)
        stat[statTypes.year] = new Array(statLimit).fill(0)
        state.stats[account.name] = stat
    })
    state.transactions = []
    state.currency.elapsedTime = 0
    state.currency.lastMelt = 0
    state.currency.monetaryMass = 0
    state.currency.nbMembers = 0
}

funiter.play = (autoPlay = true) => {
    if (!funiter.isPlaying) {
        if (timeOutId != 0) {
            clearTimeout(timeOutId)
            timeOutId = 0
        }
        funiter.isPlaying = true
        play(autoPlay)
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
