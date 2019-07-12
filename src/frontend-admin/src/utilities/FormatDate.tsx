export const formatDate = (date: string) => {
    const obj = new Date(date)
    const formatted = obj.getMonth() + 1 + '/' + obj.getDate() + '/' + obj.getFullYear()
    return date ? formatted : '-'
}

export const getDays = (hireDate: string) => {
    const today = new Date()
    const hired = new Date(hireDate)
    return Math.round(Math.abs(today.getTime() - hired.getTime()))
}

//does not account for leap years or variable # of days in a month
export const calculateDaysEmployed = (dif: number) => {
    var oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds

    var days = Math.floor(dif / oneDay)
    var months = Math.floor(days / 31)
    var years = Math.floor(months / 12)

    months = Math.floor(months % 12)
    days = Math.floor(days % 31)

    var ret: string = ''
    ret += years !== 0 ? (years === 1 ? years + ' year, ' : years + ' years, ') : ''
    ret += months !== 0 ? (months === 1 ? months + ' month, ' : months + ' months, ') : ''
    ret += days === 1 ? days + ' day' : days + ' days'
    return ret
}
