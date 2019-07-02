import React from 'react'

// Packages

// Components

// Utils

// Styles
import styles from './ProgramOverviewEditPage.module.css'

// Types
interface IProgramOverviewEditPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramOverviewEditPage: React.SFC<IProgramOverviewEditPageProps> = props => {
    const {history, match, ...rest} = props

    return <div>overview edit</div>
}
