import React from 'react'

// Components
import {Card} from '../../../reusables'

import {formatMoney} from '../../../../utilities/FormatCost'
// Styles
import styles from './CostCard.module.css'

// Primary Component
interface ICostCardProps {
    cardTitle: string
    data: {
        programsCost: number
        pluginsCost: number
    }
    icon: any
}

export const CostCard = (props: ICostCardProps) => {
    const {
        cardTitle,
        icon,
        data: {programsCost, pluginsCost},
    } = props

    return (
        <Card title={cardTitle}>
            <div>{icon}</div>
            <div className={styles.titleContainer}>
                <div className={styles.title}>{formatMoney(programsCost + pluginsCost)}</div>
                <div className={styles.subtitle}>Programs: {formatMoney(programsCost)}</div>
                <div className={styles.subtitle}>Plugins: {formatMoney(pluginsCost)}</div>
            </div>
        </Card>
    )
}
