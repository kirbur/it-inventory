import {cloneDeep} from 'lodash'

export function quickSortAscend(low: number, high: number, datumIndex: number, rows: any[][]) {
    //TODO: override the comparison for strings maybe??? so this can be reused
    let i = low
    let j = high
    let pivot = high
    while (i <= j) {
        // check if number on left of pivot is > than the pivot
        // and swap it if it is
        while (rows[i][datumIndex].sortBy < rows[pivot][datumIndex].sortBy) {
            i++
        }
        while (rows[j][datumIndex].sortBy > rows[pivot][datumIndex].sortBy) {
            j--
        }
        if (i <= j) {
            //exchange the numbers then increment again
            ;[rows[i], rows[j]] = [rows[j], rows[i]]
            i++
            j--
        }
    }
    if (low < j) {
        quickSortAscend(low, j, datumIndex, rows)
    }
    if (i < high) {
        quickSortAscend(i, high, datumIndex, rows)
    }
    return rows
}

export function quickSortDescend(low: number, high: number, datumIndex: number, rows: any[][]) {
    let i = low
    let j = high
    let pivot = high

    while (i <= j) {
        // check if number on left of pivot is < than the pivot
        // and swap it if it is
        while (rows[i][datumIndex].sortBy > rows[pivot][datumIndex].sortBy) {
            i++
        }
        while (rows[j][datumIndex].sortBy < rows[pivot][datumIndex].sortBy) {
            j--
        }
        if (i <= j) {
            //exchange the numbers then increment again
            ;[rows[i], rows[j]] = [rows[j], rows[i]]
            i++
            j--
        }
    }
    if (low < j) {
        quickSortDescend(low, j, datumIndex, rows)
    }
    if (i < high) {
        quickSortDescend(i, high, datumIndex, rows)
    }
    return rows
}

//sortTable takes in the data as a matrix as the first parameter and the
//row index of the value you are comparing as the secodn parameter
export function sortTable(rows: any[][], dataIndex: number, sortValue: number) {
    var tempData = cloneDeep(rows)

    if (rows.length > 0) {
        //low, high, and pivot are indices
        var low = 0
        var high = rows.length - 1

        if (sortValue == 0) {
            //--> ascending order
            quickSortAscend(low, high, dataIndex, tempData)
        } else if (sortValue == 1) {
            //--> descending order
            quickSortDescend(low, high, dataIndex, tempData)
        }
    }
    return tempData
}
