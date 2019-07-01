import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import Axios from 'axios'
// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramOverviewPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramOverviewPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramOverviewPage: React.SFC<IProgramOverviewPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [programData, setProgramData] = useState<any>({})
    const [programRows, setProgramRows] = useState<any[]>([])
    const [pluginRows, setPluginRows] = useState<any[]>([])

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    useEffect(() => {
        fetch('https://localhost:44358/api/detail/ProgramOverview/123.Net')
            .then(res => {
                console.log(res)
                return res.json()
            })
            .then(data => {
                console.log(data)
            })
            .catch(err => console.error(err))

        Axios.get('https://localhost:44358/api/detail/ProgramOverview/123.Net')
            .then(res => {
                console.log(res.data)
            })
            .catch((err: any) => console.error(err))

        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${match.params.id}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/programs')
        }
    }

    return (
        <div className={styles.progOverviewMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Programs'
                        icon='back'
                        onClick={() => {
                            history.push('/programs')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + programData.photo} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        <p>Yearly ---------------- ${programData.yearly}</p>
                        <p>Monthly --------------- ${programData.monthly}</p>
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    //history.push('/editProgram/' + match.params.id)
                                }}
                                className={styles.editbutton}
                            />

                            <Button
                                text='Archive'
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.programName}>{match.params.id}</div>
                        <div className={styles.programText}>
                            {programData.numUsed} / {programData.numOwned} Used
                        </div>
                    </div>
                    <DetailPageTable headers={programHeaders} rows={programRows} setRows={setProgramRows} />
                    <DetailPageTable headers={pluginHeaders} rows={pluginRows} setRows={setPluginRows} />
                </div>
            </div>
        </div>
    )
}
