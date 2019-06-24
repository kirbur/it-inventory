import React from 'react'

// Packages

// Components

// Utils

// Styles
import styles from './LaptopsListPage.module.css'

// Types
interface ILaptopsListPageProps {
    history: any
}

// Helpers

// Primary Component
export const LaptopsListPage: React.SFC<ILaptopsListPageProps> = props => {
    const {history, ...rest} = props

    return <div>laptops list</div>
}
