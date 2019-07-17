export const format = (x: string) => {
    //if x is empty, null, or only whitespace
    return x ? (x !== ('' || ' ') ? x : '-') : '-'
    // if (x === ('' || ' ' || null || undefined)) {
    //     return '-'
    // } else {
    //     return x
    // }
}
