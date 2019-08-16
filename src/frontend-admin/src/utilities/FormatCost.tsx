export const formatCost = (isPerYear: boolean, perYear: number, perUse: number) => {
    return isPerYear
        ? formatMoney(perYear) + ' /yr'
        : perYear === 0
        ? formatMoney(perUse) + ' paid'
        : formatMoney(perYear / 12) + ' /mo'
}

//used: https://flaviocopes.com/how-to-format-number-as-currency-javascript/
export const formatMoney = (money: number) => {
    const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})
    return formatter.format(money)
}
