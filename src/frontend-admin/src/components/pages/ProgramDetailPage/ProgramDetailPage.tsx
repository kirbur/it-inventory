import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramDetailPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramDetailPageProps {
    history: any
    match: any
}

// Primary Component
export const ProgramDetailPage: React.SFC<IProgramDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [progData, setProgData] = useState<any>({})
    const [historyList, setHistoryList] = useState<any[]>([])
    const [progRows, setProgRows] = useState<any[]>([])
    const progHeaders = ['License Key', 'Purchase Link']

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    dateBought: formatDate(data[0].dateBought),
                    description: format(data[0].descriptio),
                    employee: format(data[0].employeeName),
                    employeeId: format(data[0].employeeId),
                    icon: format(data[0].picture),
                    renewalDate: formatDate(data[0].renewalDate),
                    isCostPerYear: data[0].isCostPerYear,
                    flatCost: data[0].programFlatCost,
                    costPerYear: data[0].programCostPerYear,
                })
                setProgRows([
                    [
                        0,
                        format(data[0].programLicenseKey ? data[0].programLicenseKey : '-'),
                        format(data[0].programPurchaseLink),
                    ],
                ])
                setHistoryList(data[0].entries)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive this copy of ${progData.name}?`)) {
            //TODO: a post request to archive program w/ id match.params.id
            history.push(`/programs/overview/${progData.name}`)
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
                        <img className={styles.img} src={URL + progData.icon} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        {progData.flatCost !== 0 ? (
                            <p>Paid ------------------ ${progData.flatCost}</p>
                        ) : progData.isCostPerYear ? (
                            <p>Yearly ---------------- ${progData.costPerYear}</p>
                        ) : (
                            <p>Monthly --------------- ${Math.round((progData.costPerYear / 12) * 100) / 100}</p>
                        )}
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
                                    history.push('/editProgram/' + match.params.id)
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
                        <div className={styles.programName}>{progData.name}</div>
                        <div className={styles.programText}>Renewal Date: {progData.renewalDate}</div>
                        <div className={styles.programText}>Purchase Date: {progData.dateBought}</div>
                        <div className={s(styles.programText, styles.assignedTo)}>
                            Assigned to{' '}
                            <div
                                className={styles.empName}
                                onClick={() => history.push(`/employees/${progData.employeeId}`)}
                            >
                                {progData.employee}
                            </div>
                        </div>
                    </div>
                    <DetailPageTable headers={progHeaders} rows={progRows} setRows={setProgRows} />
                    <div className={styles.descriptionContainer}>
                        <div className={styles.descriptionTitle}>Description</div>
                        <div className={styles.descritptionBody}>{progData.description}</div>
                    </div>
                    {/* history List*/}
                </div>
            </div>
        </div>
    )
}
