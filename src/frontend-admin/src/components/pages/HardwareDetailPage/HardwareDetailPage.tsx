import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'

// Utils
import {formatDate} from '../../../utilities/FormatDate'

// Styles
import styles from './HardwareDetailPage.module.css'
import laptopPlaceholder from '../../../content/Images/Placeholders/computer-placeholder.png'
import serverPlaceholder from '../../../content/Images/Placeholders/server-placeholder.png'
import peripheralPlaceholder from '../../../content/Images/Placeholders/peripheral-placeholder.png'
import monitorPlaceholder from '../../../content/Images/Placeholders/monitor-placeholder.png'

// Context
import {LoginContext} from '../../App/App'
import {sortByDate} from '../../../utilities/quickSort'

// Types
interface IHardwareDetailPageProps {
    history: any
    match: any
}

// Primary Component
export const HardwareDetailPage: React.SFC<IHardwareDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken, isAdmin},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)

    //default
    const [firstTableHeaders, setFirstTableHeaders] = useState(['yeah something went wrong'])
    const [secondTableHeaders, setSecondTableHeaders] = useState(['yeah something went wrong'])
    const [thirdTableHeaders, setThirdTableHeaders] = useState(['yeah something went wrong'])
    const [headingInfo, setHeadingInfo] = useState(['something aint right'])

    const [firstTableData, setFirstTableData] = useState<(string | number)[]>([])
    const [secondTableData, setSecondTableData] = useState<(string | number)[]>([])
    const [thirdTableData, setThirdTableData] = useState<(string | number)[]>([])

    const [historyLogEntries, setHistoryLogEntries] = useState<any[]>([])
    const [commentText, setCommentText] = useState('')

    const [costPerYear, setCostPerYear] = useState(0)
    const [flatCost, setFlatCost] = useState(0)

    const [img, setImg] = useState()

    useEffect(() => {
        if (match.params.type === 'server') {
            setFirstTableHeaders(['FQDN', 'IP Address', '# of Cores', 'OS', 'RAM'])
            setSecondTableHeaders(['MFG Tag', 'Serial #', 'SAN', 'Local HHD'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife virtualized
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/server/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    if (data !== '') {
                        setImg(data[0].icon)
                    } else {
                        setImg(serverPlaceholder)
                    }
                    setHeadingInfo([
                        'Make: ' + data[0].server.make,
                        'Model: ' + data[0].server.model,
                        'Purchase Date: ' + formatDate(data[0].server.purchaseDate),
                        'Renewal Date: ' + formatDate(data[0].server.renewalDate),
                        'End of Life: ' + formatDate(data[0].server.endOfLife),
                        'Virtualized: ' + data[0].server.virtualize,
                    ])
                    setFirstTableData([
                        data[0].server.fqdn,
                        data[0].server.ipAddress,
                        data[0].server.numberOfCores,
                        data[0].server.operatingSystem,
                        data[0].server.ram,
                    ])
                    setSecondTableData([
                        data[0].server.mfg,
                        data[0].server.serialNumber,
                        data[0].server.san,
                        data[0].server.localHHD,
                    ])
                    setCostPerYear(data[0].server.costPerYear)
                    setFlatCost(data[0].server.flatCost)

                    setThirdTableData([data[0].employeeAssignedName, data[0].departmentName, data[0].server.location])
                    setCommentText(data[0].server.textField)
                    setHistoryLogEntries(data[0].serverHistory)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'laptop') {
            setFirstTableHeaders(['CPU', 'RAM', 'SSD', 'FQDN'])
            setSecondTableHeaders(['Monitor Output', 'Screen Size', 'Serial #', 'MFG Tag'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife
            setHeadingInfo(['name', 'the make', 'model name'])
            axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    if (data !== '') {
                        setImg(data[0].icon)
                    } else {
                        setImg(laptopPlaceholder)
                    }
                    setHeadingInfo([
                        'Make: ' + data[0].computer.make,
                        'Model: ' + data[0].computer.model,
                        'Purchase Date: ' + formatDate(data[0].computer.purchaseDate),
                        'Renewal Date: ' + formatDate(data[0].computer.renewalDate),
                        'End of Life: ' + formatDate(data[0].computer.endOfLife),
                    ])
                    setFirstTableData([
                        data[0].computer.cpu,
                        data[0].computer.ramgb,
                        data[0].computer.ssdgb,
                        data[0].computer.fqdn,
                    ])
                    setSecondTableData([
                        data[0].computer.monitorOutput,
                        data[0].computer.screenSize,
                        data[0].computer.serialNumber,
                        data[0].computer.mfg,
                    ])
                    setCostPerYear(data[0].computer.costPerYear)
                    setFlatCost(data[0].computer.flatCost)

                    setThirdTableData([data[0].employeeAssignedName, data[0].departmentName, data[0].computer.location])
                    setCommentText(data[0].computer.textField)
                    setHistoryLogEntries(data[0].computerHistory)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstTableHeaders(['Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/monitor/${match.params.id}`)
                .then((data: any) => {
                    if (data !== '') {
                        setImg(data[0].icon)
                    } else {
                        setImg(monitorPlaceholder)
                    }
                    setHeadingInfo([
                        'Make: ' + data[0].monitor.make,
                        'Model: ' + data[0].monitor.model,
                        'Purchase Date: ' + formatDate(data[0].monitor.purchaseDate),
                        'Renewal Date: ' + formatDate(data[0].monitor.renewalDate),
                        // 'End of Life: ' + formatDate(data[0].monitor.endOfLife),
                    ])
                    setFirstTableData([
                        data[0].monitor.screenSize,
                        data[0].monitor.resolution,
                        data[0].monitor.inputs,
                        data[0].monitor.serialNumber,
                    ])
                    setSecondTableData([])
                    setThirdTableData([data[0].employeeAssignedName, data[0].departmentName, data[0].monitor.location])
                    setCostPerYear(data[0].monitor.costPerYear)
                    setFlatCost(data[0].monitor.flatCost)
                    setCommentText(data[0].monitor.textField)
                    setHistoryLogEntries(data[0].monitorHistory)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstTableHeaders(['Employee Assigned', 'Department Assigned', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders([])
            axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    if (data !== '') {
                        setImg(data[0].icon)
                    } else {
                        setImg(peripheralPlaceholder)
                    }
                    setHeadingInfo([
                        'Name: ' + data[0].peripheral.peripheralName,
                        'Type: ' + data[0].peripheral.peripheralType,
                        'Purchase Date: ' + formatDate(data[0].peripheral.purchaseDate),
                    ])
                    setFirstTableData([
                        data[0].employeeAssignedName,
                        data[0].departmentName,
                        data[0].peripheral.serialNumber,
                    ])
                    setSecondTableData([])
                    setThirdTableData([])
                    setCostPerYear(data[0].peripheral.costPerYear)
                    setFlatCost(data[0].peripheral.flatCost)
                    setCommentText(data[0].peripheral.textField)
                    setHistoryLogEntries(data[0].peripheralHistory)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    async function handleArchive() {
        if (window.confirm(`Are you sure you want to archive this ${match.params.type}?`)) {
            await axios.put(`archive/${match.params.type}/${match.params.id}`, {})
            history.push('/hardware')
        }
    }

    function renderFlatCost() {
        if (flatCost !== undefined && flatCost !== null && flatCost !== 0) {
            return (
                <Group>
                    <p>Initial Cost</p>
                    <div className={styles.costLine} />
                    <p>${flatCost} </p>
                </Group>
            )
        }
    }
    function renderCostPerYear() {
        if (costPerYear !== undefined && costPerYear !== null && costPerYear !== 0) {
            return (
                <Group>
                    <p>Cost Per Year</p>
                    <div className={styles.costLine} />
                    <p>${costPerYear} </p>
                </Group>
            )
        }
    }

    return (
        <div className={styles.detailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Hardware'
                        icon='back'
                        onClick={() => {
                            history.push('/hardware')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + img} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        {renderFlatCost()}
                        {renderCostPerYear()}
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
                                    history.push('/hardware/edit/' + match.params.type + '/' + match.params.id)
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

                    {/* title/makeModel/dates/virtualized */}
                    <div className={styles.titleText}>
                        <div className={styles.hardwareName}>{match.params.type}</div>
                        {headingInfo.map((heading: string) => (
                            <div className={styles.hardwareText}>{heading} </div>
                        ))}
                    </div>

                    {/* tables? */}
                    <div className={styles.tableContainer}>
                        {/* first table */}
                        <table className={styles.table}>
                            <tr>
                                {firstTableHeaders.map((header: string) => (
                                    <td className={styles.header}>{header}</td>
                                ))}
                            </tr>
                            <tr>
                                {firstTableData.map((datum: string | number) => (
                                    <td className={styles.rowData}>{datum}</td>
                                ))}
                            </tr>
                        </table>
                        {/* second table */}
                        <table className={styles.table}>
                            <tr>
                                {secondTableHeaders.map((header: string) => (
                                    <td className={styles.header}>{header}</td>
                                ))}
                            </tr>
                            <tr>
                                {secondTableData.map((datum: string | number) => (
                                    <td className={styles.rowData}>{datum}</td>
                                ))}
                            </tr>
                        </table>
                        {/* third table */}
                        <table className={styles.table}>
                            <tr>
                                {thirdTableHeaders.map((header: string) => (
                                    <td className={styles.header}>{header}</td>
                                ))}
                            </tr>
                            <tr>
                                {thirdTableData.map((datum: string | number) => (
                                    <td className={styles.rowData}>{datum}</td>
                                ))}
                            </tr>
                        </table>
                    </div>

                    {/* history log */}
                    <div className={styles.historyLogContainer}>
                        <HistoryLog historyLog={sortByDate(historyLogEntries)} canEdit={false} />
                    </div>

                    {/* comment section */}
                    <div>
                        <table className={styles.table}>
                            <tr>
                                <td className={styles.header}>Text Field</td>
                            </tr>
                            <tr>
                                <td className={styles.rowData}>{commentText}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
