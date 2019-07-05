export const formatCost = (isPerYear: boolean, perYear: number, perUse: number) => {
    return isPerYear
        ? '$' + perYear + ' /yr'
        : perYear === 0
        ? '$' + perUse + ' paid'
        : '$' + Math.round((perYear / 12) * 100) / 100 + ' /mo'
}
