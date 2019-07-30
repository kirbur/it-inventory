import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog, IHistoryLogArray} from '../../reusables/HistoryLog/HistoryLog'
import {History} from 'history'
import {match} from 'react-router-dom'
import {BackButton} from '../../reusables/BackButton/BackButton'
import {DetailImage} from '../../reusables/DetailImage/DetailImage'
import {DetailCostText} from '../../reusables/DetailCostText/DetailCostText'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {checkImage} from '../../../utilities/CheckImage'

// Styles
import styles from './ProgramDetailPage.module.css'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramDetailPageProps {
    history: History
    match: match<{id: string}>
}

// Primary Component
export const ProgramDetailPage: React.SFC<IProgramDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)

    var axios = new AxiosService(loginContextVariables)

    const [isDeleted, setIsDeleted] = useState(false)
    const [img, setImg] = useState('')
    const [progData, setProgData] = useState<{
        name: string
        dateBought: string
        description: string
        employee: string
        employeeId: number
        renewalDate: string
        isCostPerYear: boolean
        flatCost: number
        costPerYear: number
        hasPlugin: boolean
    }>({
        name: '',
        dateBought: '',
        description: '',
        employee: '',
        employeeId: -1,
        renewalDate: '',
        isCostPerYear: false,
        flatCost: 0,
        costPerYear: 0,
        hasPlugin: false,
    })
    const [historyList, setHistoryList] = useState<IHistoryLogArray[]>([])
    const [progRows, setProgRows] = useState<ITableItem[][]>([])
    const progHeaders = ['License Key', 'Purchase Link']

    async function getData() {
        await axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    dateBought: formatDate(data[0].dateBought),
                    description: format(data[0].description),
                    employee: data[0].employeeName,
                    employeeId: data[0].employeeId,
                    renewalDate: formatDate(data[0].renewalDate),
                    isCostPerYear: data[0].isCostPerYear,
                    flatCost: data[0].programFlatCost,
                    costPerYear: data[0].programCostPerYear,
                    hasPlugin: data[0].hasPlugIn,
                })

                setIsDeleted(data[0].isDeleted)
                setProgRows([
                    [
                        {value: format(data[0].programLicenseKey ? data[0].programLicenseKey : '-'), sortBy: 0},
                        {value: format(data[0].programPurchaseLink), sortBy: 0},
                    ],
                ])

                setHistoryList([
                    ...data[0].entries.map((entry: any) => {
                        return {
                            eventDate: entry.eventDate,
                            eventType: entry.eventType,
                            employeeName: entry.employeeNameHistory,
                        }
                    }),
                ])

                checkImage(data[0].picture, axios, placeholder)
                    .then(image => setImg(image))
                    .catch(err => console.error(err))
            })
            .catch((err: any) => console.error(err))
    }

    useEffect(() => {
        getData()
    }, [])

    async function handleArchive() {
        if (progData.hasPlugin && !isDeleted) {
            window.alert('Please archive the plugins before you archive this program.')
        } else if (isDeleted) {
            if (window.confirm(`Are you sure you want to recover this copy of ${progData.name}?`)) {
                await axios.put(`recover/program/${match.params.id}`, {}).catch((err: any) => console.error(err))

                history.push({
                    pathname: `/programs/edit/detail/${match.params.id}/inventory`,
                    state: {prev: history.location},
                })
            }
        } else {
            if (window.confirm(`Are you sure you want to archive this copy of ${progData.name}?`)) {
                await axios.put(`archive/program/${match.params.id}`, {}).catch((err: any) => console.error(err))

                history.push({
                    pathname: `/programs/overview/${progData.name}/inventory`,
                    state: {prev: history.location},
                })
            }
        }
    }

    return (
        <div className={styles.progDetailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    <DetailImage src={img} />
                    {progData.flatCost > 0 && (
                        <DetailCostText
                            costTexts={[
                                {title: 'Paid', cost: `$${progData.flatCost}`},
                            ]}
                        />
                    )}
                    {progData.isCostPerYear ? (
                        <DetailCostText
                        costTexts={[
                            {title: 'Yearly', cost: `$${progData.costPerYear}`},
                        ]}
                    />
                    ) : (
                        progData.costPerYear > 0 && (
                            <DetailCostText
                            costTexts={[
                                {title: 'Monthly', cost: `$${progData.costPerYear}`},
                            ]}
                        />
                        )
                    )}
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            {!isDeleted && (
                                <Button
                                    text='Edit'
                                    icon='edit'
                                    onClick={() => {
                                        history.push({
                                            pathname: '/programs/edit/detail/' + match.params.id,
                                            state: {prev: history.location},
                                        })
                                    }}
                                    className={styles.editbutton}
                                />
                            )}

                            <Button
                                text={isDeleted ? 'Recover' : 'Archive'}
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.programName}>
                            <Group>
                                <div
                                    className={styles.overviewLink}
                                    onClick={() =>
                                        history.push({
                                            pathname: `/programs/overview/${progData.name}/${
                                                isDeleted ? 'archived' : 'inventory'
                                            }`,
                                            state: {prev: history.location},
                                        })
                                    }
                                >
                                    {progData.name}
                                </div>
                                {`Copy ${match.params.id}`}
                            </Group>
                        </div>
                        {progData.renewalDate !== '-' && (
                            <div className={styles.programText}>Renewal Date: {progData.renewalDate}</div>
                        )}
                        <div className={styles.programText}>Purchase Date: {progData.dateBought}</div>
                        {progData.employeeId !== -1 && (
                            <div className={s(styles.programText, styles.assignedTo)}>
                                Assigned to{' '}
                                <div
                                    className={styles.empName}
                                    onClick={() =>
                                        history.push({
                                            pathname: `/employees/detail/${progData.employeeId}`,
                                            state: {prev: history.location},
                                        })
                                    }
                                >
                                    {progData.employee}
                                </div>
                            </div>
                        )}
                    </div>

                    <DetailPageTable
                        headers={progHeaders}
                        rows={progRows}
                        setRows={setProgRows}
                        sort={false}
                        hover={false}
                    />

                    <div className={styles.spaceBetween} />

                    <div className={styles.descriptionContainer}>
                        <div className={styles.descriptionTitle}>Description</div>
                        <div className={styles.descriptionBody}>{progData.description}</div>
                    </div>

                    <div className={styles.spaceBetween} />
                    <HistoryLog historyLog={historyList} canEdit={false} />
                </div>
            </div>
        </div>
    )
}
