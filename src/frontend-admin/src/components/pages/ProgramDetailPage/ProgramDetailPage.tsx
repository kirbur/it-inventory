import React from 'react'

// Packages

// Components

// Utils

// Styles
//import styles from './ProgramDetailPage.module.css'

// Types
interface IProgramDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramDetailPage: React.SFC<IProgramDetailPageProps> = props => {
    const {history, match, ...rest} = props

    return <div>The is {match.params.id}'s program detail page</div>
}
