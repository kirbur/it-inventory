export const format = (x: string) => {
    //if x is empty, null, or only whitespace
    if (x === '') {
        return '-'
    } else {
        return x
    }
}
