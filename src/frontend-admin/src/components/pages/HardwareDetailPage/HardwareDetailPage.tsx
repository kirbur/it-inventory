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

    var firstTableData: string | number[] = []
    var secondTableData: string | number[] = []
    var thirdTableData: string | number[] = []

    useEffect(() => {
        if (match.params.type === 'server') {
            setFirstTableHeaders(['FQDN', 'IP Address', '# of Cores', 'OS', 'RAM'])
            setSecondTableHeaders(['MFG Tag', 'Serial #', 'SAN', 'Local HDD'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife virtualized
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/hardware/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    firstTableData = [data.FQDN, data.ipAddress, data.numberOfCores, data.operatingSystem, data.ram]
                    secondTableData = []
                    thirdTableData = []
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'laptop') {
            setFirstTableHeaders(['CPU', 'RAM', 'SSD', 'FQDN'])
            setSecondTableHeaders(['Monitor Output', 'Screen Size', 'Serial #'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/hardware/${match.params.id}`)
                .then((data: any) => {
                    firstTableData = []
                    secondTableData = []
                    thirdTableData = []
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstTableHeaders(['Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned'])
            // make model
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/hardware/${match.params.id}`)
                .then((data: any) => {
                    firstTableData = []
                    secondTableData = []
                    thirdTableData = []
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstTableHeaders(['Employee Assigned', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders([])
            // im not sure
            setHeadingInfo(['the name', 'another name'])
            axios
                .get(`/detail/hardware/${match.params.id}`)
                .then((data: any) => {
                    firstTableData = []
                    secondTableData = []
                    thirdTableData = []
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
                        {/* <p>Software ---------------- ${userData.swCost} /month</p>
                        <p>Hardware --------------- ${userData.hwCost}</p> */}
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
                        {/* <div className={styles.hardwareText}>Make: </div>
                        <div className={styles.hardwareText}>Model: </div>
                        <div className={styles.hardwareText}>Purchased Date: </div>
                        <div className={styles.hardwareText}>Renewal Date: </div>
                        <div className={styles.hardwareText}>End of Life: </div>
                        <div className={styles.hardwareText}>Virtualized: yes/no </div> */}
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
                                    <td className={styles.rowData}></td>
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
                                    <td className={styles.rowData}></td>
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
                                    <td className={styles.rowData}></td>
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
                                <td className={styles.rowData}>
                                    In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to
                                    demonstrate the visual form of a document without relying on meaningful content.
                                    Replacing the actual content with placeholder text allows designers to design the
                                    form of the content before the content itself has been produced.
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
