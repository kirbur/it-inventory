import React from 'react'

// Styles
//import styles from './DepartmentDetailPage.module.css';

// Types
interface IDepartmentDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const DepartmentDetailPage: React.SFC<IDepartmentDetailPageProps> = props => {
    const {history, match} = props

    return <div>The is the {match.params.id} department detail page</div>
}
