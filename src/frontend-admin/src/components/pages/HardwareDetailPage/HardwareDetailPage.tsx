import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './HardwareDetailPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IHardwareDetailPageProps {
    history: any
    match: any
}

// Primary Component
export const HardwareDetailPage: React.SFC<IHardwareDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [hardwareData, setUserData] = useState<any>({})

    //default
    const [firstTableHeaders, setFirstTableHeaders] = useState(['yeah something went wrong'])
    const [secondTableHeaders, setSecondTableHeaders] = useState(['yeah something went wrong'])
    const [thirdTableHeaders, setThirdTableHeaders] = useState(['yeah something went wrong'])
    const [headingInfo, setHeadingInfo] = useState(['something aint right'])

    const [firstTableData, setFirstTableData] = useState<(string | number)[]>([])
    const [secondTableData, setSecondTableData] = useState<(string | number)[]>([])
    const [thirdTableData, setThirdTableData] = useState<(string | number)[]>([])

    const [commentText, setCommentText] = useState('')

    useEffect(() => {
        if (match.params.type === 'server') {
            setFirstTableHeaders(['FQDN', 'IP Address', '# of Cores', 'OS', 'RAM'])
            setSecondTableHeaders(['MFG Tag', 'Serial #', 'SAN', 'Local HDD'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife virtualized
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/server/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
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
                        data[0].server.localHDD,
                    ])
                    setThirdTableData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].server.location])
                    setCommentText(data[0].server.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'laptop') {
            setFirstTableHeaders(['CPU', 'RAM', 'SSD', 'FQDN'])
            setSecondTableHeaders(['Monitor Output', 'Screen Size', 'Serial #'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
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
                    ])
                    setThirdTableData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].computer.location])
                    setCommentText(data[0].computer.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstTableHeaders(['Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned'])
            // make model
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/monitor/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstTableData([
                        data[0].monitor.screenSize,
                        data[0].monitor.resolution,
                        data[0].monitor.inputs,
                        data[0].monitor.serialNumber,
                    ])
                    setSecondTableData([])
                    setThirdTableData([data[0].employeeAssignedName, 'NEED TO ADD'])
                    setCommentText(data[0].monitor.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstTableHeaders(['Employee Assigned', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders([])
            // im not sure
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstTableData([data[0].employeeAssignedName, data[0].peripheral.serialNumber])
                    setSecondTableData([])
                    setThirdTableData([data[0].employeeAssignedName, 'NEED TO ADD'])
                    setCommentText(data[0].peripheral.textField)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${hardwareData.name}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/employees')
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
                        {/* <img className={styles.img} src={URL + userData.photo} alt={''} /> */}
                    </div>
                    <div className={styles.costText}>
                        <p>Cost ---------------------- $ 5000 /month</p>
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
                                    history.push('/editHardware/' + match.params.type + '/' + match.params.id)
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
                        <div className={styles.hardwareName}>Server Name</div>
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
                        <HistoryLog historyLog={[{date: 'some day', event: 'Assigned', user: 'Jo'}]} />
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
