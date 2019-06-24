import React from 'react'

// Packages

// Components

// Utils

// Styles
import styles from './HardwareListPage.module.css'

// Types
interface IPeripheralListPageProps {
    history: any
}

// Helpers

// Primary Component
export const PeripheralListPage: React.SFC<IPeripheralListPageProps> = props => {
    const {history, ...rest} = props

    return <div>List</div>
}
