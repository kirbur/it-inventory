import React from 'react'
import styles from './DetailCostText.module.css'
import {Group} from '../Group/Group'


export interface ICostText {
    title: string,
    cost: string,
}

interface IDetailCostText {
    costTexts: ICostText[]
}

/*
Component to display the hardware and software costs on the detail pages.
*/
export const DetailCostText: React.FC<IDetailCostText> = props => {
    const {
        costTexts
    } = props
    return (
        <div className={styles.costText}>
        {costTexts.map(costText => (
            <Group>
                <p>{costText.title}</p>
                <div className={styles.costLine} />
                <p>{costText.cost}</p>
            </Group>
        ))}

    </div>
    )
}
