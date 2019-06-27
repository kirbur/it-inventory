export const format = (str?: string | null, num?: number | null) => {
    if (str !== undefined) {
        //if str is empty, null, or only whitespace
        if (str === '' || str === null) {
            return '-'
        } else {
            return str
        }
    }

    if (num !== undefined) {
        if (num === null) {
            return '-'
        } else {
            return num
        }
    }

    return '-'
}
