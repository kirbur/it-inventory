// Search through data based on current value
// of search bar and save results in filtered
export const searchFilter = (data: any, filter: string, search: string) => {
    var filtered = data.filter((row: any) => {
        return !row[filter]
            ? false
            : row[filter]
                  .toString()
                  .toLowerCase()
                  .search(search.toLowerCase()) !== -1
    })
    return filtered
}
