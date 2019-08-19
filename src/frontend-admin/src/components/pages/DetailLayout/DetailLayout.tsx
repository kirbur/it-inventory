import React, {useContext} from 'react'
import {History} from 'history'

// Components
import {Group} from '../../reusables/Group/Group'
import {BackButton} from '../../reusables/BackButton/BackButton'
import {DetailImage} from '../../reusables/DetailImage/DetailImage'
import {DetailCostText, ICostText} from '../../reusables/DetailCostText/DetailCostText'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {ThemeContext} from '../../App/App'

// Styles
import styles from './DetailLayout.module.css'

// Types
interface IDetailLayoutProps {
    history: History
    picture: any
    costTexts?: ICostText[]
    buttons: any
    children: any
}

// Helpers

// Primary Component
export const DetailLayout: React.SFC<IDetailLayoutProps> = props => {
    const {history, picture, costTexts, buttons, children} = props
    const {isDarkMode} = useContext(ThemeContext)

    return (
        <div className={s(styles.LayoutMain, isDarkMode ? styles.backgroundDark : {})}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    {picture}
                    {costTexts && <DetailCostText costTexts={costTexts} />}
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    <Group direction='row' justify='start' className={styles.group}>
                        {buttons}
                    </Group>
                    {children}
                </div>
            </div>
        </div>
    )
}
