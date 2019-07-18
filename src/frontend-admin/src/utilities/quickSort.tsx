export function sortTable(rows: any[][], dataIndex: number, sortValue: number) {
    if (rows.length > 0) {
        var compareString = (a: [], b: []) => (a === b ? 0 : a < b ? -1 : 1)

        const reversemodifier = sortValue === 0 ? 1 : -1
        // const sortFunc = x => rows[0][dataIndex].sortBy
        if (rows[0][dataIndex].hasOwnProperty('sortBy')) {
            //console.log(rows[0][dataIndex].sortBy)
            rows.sort((a, b) => reversemodifier * compareString(a[dataIndex].sortBy, b[dataIndex].sortBy))
        } else {
            rows.sort((a, b) => reversemodifier * compareString(a[dataIndex], b[dataIndex]))
        }
    }
    return rows
}

export function sortByDate(rows: any[]) {
    var compareString = (a: {}, b: {}) => (a === b ? 0 : a < b ? -1 : 1)
    if (rows == undefined || rows == null) {
        return rows
    } else {
        rows.sort((a, b) => compareString(a.eventDate, b.eventDate))
        return rows
    }
}

// type SortDirection = 'asc' | 'desc'
