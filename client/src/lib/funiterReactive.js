import funiter from '../lib/funiter.js'
import { evaluate } from 'mathjs/number'
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
funiterProxy.addAccounts = accounts => {
    if (!accounts)
        return

    accounts.forEach(account => {
        if (!funiter.createAccount(account)) 
          funiter.updateAccount(account.name, account)
    })

    funiterProxy.refresh()
}


funiterProxy.createAccount = newAccount => {
    let account = funiter.createAccount(newAccount)
    if (account) {
        funiterProxy.accounts.push(account)
        funiterProxy.refresh()
    }
    return account
}

funiterProxy.updateAccount = (oldAccount, newAccount) => {
    let account = funiter.updateAccount(oldAccount.name, newAccount)
    if (account) {
        account = Object.assign(oldAccount, account)
        funiterProxy.refresh()
    }
    return account
}

funiterProxy.deleteAccount = (accountToDelete) => {
    let account = null;
    if (funiter.deleteAccount(accountToDelete.name)) {
        if (funiterProxy.isSelected(accountToDelete)) {
            funiterProxy.select(accountToDelete)
        }
        account = accountToDelete
        funiterProxy.refresh()
    }
    return account
}

funiterProxy.getAccountTx = (id, limit) => {
    return funiter.getAccountTx(id, limit)
}

funiterProxy.getAccountStats = (id, period = statTypes.day) => {
    return funiter.getAccountStats(id, period)
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

funiterProxy.getState = () => {
    const state = funiter.getState()
    state.selectedAccounts = funiterProxy.selectedAccounts
    return state
}

funiterProxy.restoreState = state => {
    if (state.selectedAccounts)
        funiterProxy.selectedAccounts = state.selectedAccounts
    
    funiter.restoreState(state)
    funiterProxy.refresh()
}


funiterProxy.currencyWithoutDecimal = (value) => {
    return Math.floor(value/uValue)
}

funiterProxy.currencyDecimal = (value) => {
    return (value/uValue).toFixed(2)
}

funiter.onDayChange = funiterProxy.onDayChange
funiter.start(evaluate, {})
funiterProxy.refresh()

export default funiterProxy
