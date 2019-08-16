import React, {useContext} from 'react'

import s from 'classnames'

import styles from './DashboardTable.module.css'

import {concatStyles} from '../../../utilities/mikesConcat'
import {ThemeContext} from '../../App'
import {formatMoney} from '../../../utilities/FormatCost'

//types
export interface IDashboardTableDatum {
    name: string
    numberOf: number
    costPerMonth: number
    projected: string //might be a bool, and if true throw in the *
    //otherwise the string is either '' or '*'
    //'*' means that it is projected
}

interface IDashboardTableProps {
    data: IDashboardTableDatum[]
    onRowClick?: (datum: IDashboardTableDatum) => void
}

export const DashboardTable = (props: IDashboardTableProps) => {
    const {data, onRowClick} = props
    const isClickable = Boolean(onRowClick)
    const {isDarkMode} = useContext(ThemeContext)

    return (
        <table className={s(styles.table, {[styles.clickable]: isClickable})}>
            <tbody>
                {data.map(datum => (
                    <tr
                        key={datum.name}
                        className={s(styles.tr, {[styles.row]: isClickable}, isDarkMode ? styles.trDark : {})}
                        onClick={
                            onRowClick
                                ? e => {
                                      onRowClick(datum)
                                  }
                                : undefined
                        }
                    >
                        <td className={concatStyles(styles.name, isDarkMode ? styles.dark : {})}>{datum.name}</td>
                        <td className={styles.numberOf}>{datum.numberOf} users</td>
                        <td className={styles.cost}>
                            {formatMoney(datum.costPerMonth)}/month | {formatMoney(datum.costPerMonth * 12)}/year
                            {datum.projected}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
