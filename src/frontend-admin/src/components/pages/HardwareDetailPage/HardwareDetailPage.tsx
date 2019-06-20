import React from 'react'

// Packages

// Components

// Utils

// Styles
//import styles from './HardwareDetailPage.module.css'

// Types
interface IHardwareDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const HardwareDetailPage: React.SFC<IHardwareDetailPageProps> = props => {
    const {history, match} = props

    return <div>The is {match.params.id}'s detail page</div>
}
