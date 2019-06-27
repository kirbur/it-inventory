export const format = (x: string | number | null) => {
    if (typeof x === 'string') {
        //if x is empty, null, or only whitespace
        if (x === '') {
            return '-'
        } else {
            return x
        }
    }
    if (typeof x === 'number') {
        return x
    }

    return '-'
}
