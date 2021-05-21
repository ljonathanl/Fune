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

const funiter = {
    name: 'fÜne',
    logo: 'fї',
    uValue: 1000,
    isPlaying: false,
    txLimit: 100,
    statLimit: 100,
    symbol: 'Ü',
    version: '0.1.1',
    stepTime: 1,
}

const state = {
    version: 1,
    beginStat: 0
}

funiter.doTx = (simpleTx, refresh = true) => {
    let tx = Object.assign({from: '', to: '', message: '', value: 0, date: new Date().toISOString(), time: state.currency.elapsedTime}, simpleTx)
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
    if (state.transactions.length > funiter.txLimit) 
        state.transactions = state.transactions.slice(state.transactions.length - funiter.txLimit)
    if (refresh)
        refreshCurrencyAndStats()
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
    refreshCurrencyAndStats()
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

    let account = state.accounts[newAccount.name] = Object.assign({name: '', balance: 0, role: 'wallet', date: new Date().toISOString(), time: state.currency.elapsedTime}, newAccount)
    refreshCurrencyAndStats()
    return account
}

funiter.updateAccount = (id, newAccount) => {
    let account = state.accounts[id]
    if (!account || account.role == 'bank' || (newAccount.name && id != newAccount.name)) 
        return null
    account = Object.assign(account, newAccount)
    refreshCurrencyAndStats()
    return account
}

funiter.deleteAccount = id => {
    let account = state.accounts[id]
    if (!account || account.name == funiter.name) 
        return null

    delete state.accounts[id]
    delete state.stats[id]
    refreshCurrencyAndStats()
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

funiter.getAccountStats = (id) => {
    if (!state.accounts[id]) 
        return null

    const stat = state.stats[id]
    if (!stat) 
        return []

    let index = state.currency.elapsedTime % funiter.statLimit

    if (state.beginStat == index)
        return [stat[state.beginStat], stat[state.beginStat]]

    if (index > state.beginStat) 
        return stat.slice(state.beginStat, index + 1)
    
    return stat.slice(state.beginStat).concat(stat.slice(0, index + 1))
}



/* 
 * DB
 */

const defaultCurrency = {
    uPerTime: 1,
    elapsedTime: 0,
    revaluationTime: 1, 
    nbMembers: 0,
    monetaryMass: 0,
    mode: modes.melt,
    lastMelt: 0,
    average: 0,
    quantitative: 1,
    expression: '0.1'
}

funiter.expressionParser = (expression, values) => {
    return parseFloat(expression)
}


const cheatRegex = /^!(.*)/
const uValue = funiter.uValue
const revaluationMessage = '!revaluation%'
const creationMessage = '!Ucreation'

const saveStat = (name, value) => {
    const index = state.currency.elapsedTime % funiter.statLimit
    let stat = state.stats[name]
    if (!stat) {
        stat = new Array(funiter.statLimit).fill(0)
        state.stats[name] = stat
    }
    stat[index] = value
}

const getAccountWeight = (account) => {
    const cheat = account.name.match(cheatRegex)
    let weight = 1
    if (cheat) {
        try {
            weight = Math.round(funiter.expressionParser(cheat[1], {M: state.currency.monetaryMass, N: state.currency.nbMembers, T: state.currency.elapsedTime})) 
        } catch (e) {}
        if (weight < 1) 
            weight = 1
    }
    return weight
}

const refreshCurrencyAndStats = () => {
    let monetaryMass = 0
    let nbMembers = 0

    Object.values(state.accounts).forEach(account => {
        if (account.role != roles.bank) {
            const weight = getAccountWeight(account) 
            if (account.role == roles.human) 
                nbMembers += weight
                
            monetaryMass += account.balance
            saveStat(account.name, Math.floor(account.balance / weight))
        }
    })

    state.currency.nbMembers = nbMembers
    state.currency.monetaryMass = monetaryMass
    state.currency.average = nbMembers > 0 ? Math.floor(monetaryMass / nbMembers) : 0
    saveStat(funiter.name, Object.assign({}, state.currency))
}

const play = (autoPlay = true) => {
    if (state.currency.elapsedTime >= 999) {
        funiter.stop()
        return
    }

    state.currency.elapsedTime++

    if (state.currency.elapsedTime >= funiter.statLimit && state.currency.elapsedTime % funiter.statLimit == state.beginStat)
        state.beginStat = (state.beginStat + 1) % funiter.statLimit 
    
    let meltValue = 0
    let meltPercent = 0
    
    const uPerTime = state.currency.uPerTime >= 0 ? Math.floor(state.currency.uPerTime) : 0
    const uGained = uValue * state.currency.revaluationTime * uPerTime
    const funiterAccount = state.accounts[funiter.name]
    
    const isRevaluation = state.currency.elapsedTime % state.currency.revaluationTime == 0

    if (isRevaluation && state.currency.nbMembers > 0) {
        meltValue = funiter.expressionParser(state.currency.expression, {M: state.currency.monetaryMass / uGained, N: state.currency.nbMembers, T: state.currency.elapsedTime})
        if (state.currency.mode == modes.grew) 
            meltValue = 1 - 1 / (1 + meltValue)
        meltValue = Math.max(0, Math.min(1, meltValue))
        meltPercent = (meltValue * 100).toFixed(2)
    }

    Object.values(state.accounts).forEach(account => {
        if (account.role != roles.bank) {
            const weight = getAccountWeight(account)
            if (isRevaluation && meltValue > 0 && account.balance > 9) {
                let melting = account.balance * meltValue
                melting = Math.min(melting > uGained ? Math.ceil(melting) : Math.floor(melting), account.balance)
                if (melting < 10)
                    melting = 10
                funiter.doTx({from: account.name, to: funiterAccount.name, message: revaluationMessage + meltPercent, value: melting}, false)
            }    
            if (account.role == roles.human && uPerTime > 0) {
                funiter.doTx({from: funiterAccount.name, to: account.name, message: creationMessage, value: weight * uValue * uPerTime}, false)
            }
        }
    })

    
    if (isRevaluation) {
        state.currency.lastMelt = meltPercent
        state.currency.quantitative = state.currency.quantitative * ( 1 + 1 / ( ( 1 / meltValue ) - 1))
    }
    
    refreshCurrencyAndStats()

    if (autoPlay)
        timeOutId = setTimeout(play, funiter.stepTime * 1000, true)

    funiter.onTimeChange(state.currency.elapsedTime)
}

funiter.getState = () => {
    return Object.assign({}, state)
}

funiter.restoreState = savedState => {
    if (!savedState || !savedState.version || savedState.version != 1)
        return false
    
    if (savedState.currency) 
        state.currency = Object.assign(defaultCurrency, savedState.currency)
    if (savedState.accounts) 
        state.accounts = savedState.accounts
    if (savedState.transactions) 
        state.transactions = savedState.transactions
    if (savedState.stats) 
        state.stats = savedState.stats
    if (savedState.beginStat)
        state.beginStat = savedState.beginStat

    return true
}


funiter.start = (expressionParser, initialState) => {
    funiter.restoreState(initialState)
    if (expressionParser)
        funiter.expressionParser = expressionParser

    if (!state.currency)
        state.currency = defaultCurrency

    if (!state.accounts) 
        state.accounts = {}

    state.accounts[funiter.name] = {name: funiter.name, balance: 0, role: roles.bank, date: new Date().toISOString(), time: 0}

    if (!state.transactions)
        state.transactions = []

    if (!state.stats) 
        state.stats = {}
}


funiter.onTimeChange = () => {
    // nothing
}

funiter.reset = () => {
    funiter.stop()
    Object.values(state.accounts).forEach(account => {
        account.balance = 0
        if (state.beginStat != 0)
            return
        const balance = state.stats[account.name][0]
        if (balance <= 0) 
            return 
        account.balance = getAccountWeight(account) * balance
         
    })
    state.transactions = []
    state.stats = {}
    state.currency.elapsedTime = 0
    state.currency.lastMelt = 0
    state.currency.quantitative = 1
    state.beginStat = 0
    refreshCurrencyAndStats()
}

funiter.play = (autoPlay = true) => {
    if (!funiter.isPlaying) {
        if (timeOutId != 0) {
            clearTimeout(timeOutId)
            timeOutId = 0
        }
        funiter.isPlaying = autoPlay
        play(autoPlay)
        return true
    }
}

funiter.unplay = () => {
    if (!funiter.isPlaying && state.currency.elapsedTime > 0) {
        const timeBefore = (state.currency.elapsedTime - 1) % funiter.statLimit
        const currency = state.stats[funiter.name][timeBefore]
        if (currency && currency.elapsedTime == state.currency.elapsedTime - 1) {
            state.currency = currency
            Object.values(state.accounts).forEach(account => {
                if (account.role != roles.bank) {
                    const weight = getAccountWeight(account)
                    account.balance = state.stats[account.name][timeBefore] * weight
                }
            })
            refreshCurrencyAndStats()
            state.transactions = state.transactions.filter(tx => tx.time <= timeBefore)
            return true
        }
    }
    return false
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

console.log(funiter.name + ' v' + funiter.version)
export default funiter
