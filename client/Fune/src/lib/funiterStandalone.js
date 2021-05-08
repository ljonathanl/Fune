import funiter from '../lib/funiter.js'
import { evaluate } from 'mathjs'
import { reactive } from 'vue'

const funiterProxy = reactive({
    name: funiter.name,
    isPlaying: false,
    currency: {},
    accounts: [],
    selectedAccounts: [funiter.name]
})

const uValue = funiter.uValue


funiterProxy.isSelected = (account) => {
    return funiterProxy.selectedAccounts.indexOf(account.name) >= 0
}

funiterProxy.select = (account) => {
    if (account.role == 'bank')
        return
    let index = funiterProxy.selectedAccounts.indexOf(account.name)
    if (index < 0) {
        funiterProxy.selectedAccounts.push(account.name)
    } else {
        funiterProxy.selectedAccounts.splice(index, 1)
    }
}



funiterProxy.doTx = tx => {
    const result = funiter.doTx({from: tx.from, to: tx.to, value: Math.floor(tx.value * uValue)})
    if (result)
        funiterProxy.refresh()
    return result
}


/* 
 * CURRENCY
 */

funiterProxy.updateCurrency = newCurrency => {
    funiterProxy.currency = funiter.updateCurrency(newCurrency)
    return funiterProxy.currency
}


/* 
 * ACCOUNT
 */
funiterProxy.createAccount = newAccount => {
    let account = funiter.createAccount(newAccount)
    if (account) {
        funiterProxy.accounts.push(account)
        account = funiterProxy.accounts[funiterProxy.length - 1]
    }
    return account
}

funiterProxy.updateAccount = (oldAccount, newAccount) => {
    let account = funiter.updateAccount(oldAccount.name, newAccount)
    if (account) 
        account = Object.assign(oldAccount, account)
    return account
}

funiterProxy.deleteAccount = (accountToDelete) => {
    let account = null;
    if (funiter.deleteAccount(accountToDelete.name)) {
        if (funiterProxy.isSelected(account)) {
            funiterProxy.select(account)
        }
        account = accountToDelete
        funiterProxy.accounts.splice(funiterProxy.accounts.indexOf(accountToDelete), 1)
    }
    return account
}

funiterProxy.getAccountTx = (id, limit) => {
    return funiter.getAccountTx(id, limit)
}

funiterProxy.getAccountStats = (id, period = statTypes.day) => {
    return funiter.getAccountStats(id, period)
}

funiterProxy.start = (initialState) => {
    funiter.onDayChange = funiterProxy.onDayChange
    funiter.start(evaluate, initialState)
    funiterProxy.refresh()
}


funiterProxy.onDayChange = () => {
    funiterProxy.refresh()
}


funiterProxy.refresh = () => {
    funiterProxy.accounts = funiter.getAccounts()
    funiterProxy.currency = funiter.getCurrency()
}

funiterProxy.reset = () => {
    funiter.reset()
    funiterProxy.refresh()
    funiterProxy.isPlaying = funiter.isPlaying
}

funiterProxy.play = (autoPlay) => {
    funiter.play(autoPlay)
    funiterProxy.refresh()
    funiterProxy.isPlaying = funiter.isPlaying
}

funiterProxy.stop = () => {
    funiter.stop()
    funiterProxy.refresh()
    funiterProxy.isPlaying = funiter.isPlaying
}


funiterProxy.currencyWithoutDecimal = (value) => {
    return Math.floor(value/uValue)
}

funiterProxy.currencyDecimal = (value) => {
    return (value/uValue).toFixed(2)
}

export default funiterProxy
