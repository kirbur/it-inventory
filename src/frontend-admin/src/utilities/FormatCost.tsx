export const formatCost = (isPerYear: boolean, perYear: number, perUse: number) => {
    return isPerYear
        ? formatMoney(perYear) + ' /yr'
        : perYear === 0
        ? formatMoney(perUse) + ' paid'
        : formatMoney(perYear / 12) + ' /mo'
}

export const formatMoney = (money: number) => {
    const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})
    return formatter.format(money)
}
