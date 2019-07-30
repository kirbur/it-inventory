import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog, IHistoryLogArray} from '../../reusables/HistoryLog/HistoryLog'
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {BackButton} from '../../reusables/BackButton/BackButton'
import {DetailImage} from '../../reusables/DetailImage/DetailImage'
import {DetailCostText, ICostText} from '../../reusables/DetailCostText/DetailCostText'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {checkImage} from '../../../utilities/CheckImage'

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
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)

    const axios = new AxiosService(loginContextVariables)

    //default
    const [firstTableHeaders, setFirstTableHeaders] = useState(['yeah something went wrong'])
    const [secondTableHeaders, setSecondTableHeaders] = useState(['yeah something went wrong'])
    const [thirdTableHeaders, setThirdTableHeaders] = useState(['yeah something went wrong'])
    const [headingInfo, setHeadingInfo] = useState(['something aint right'])

    const [firstTableData, setFirstTableData] = useState<(string | number)[]>([])
    const [secondTableData, setSecondTableData] = useState<(string | number)[]>([])
    const [thirdTableData, setThirdTableData] = useState<ITableItem[][]>([])

    const [historyLogEntries, setHistoryLogEntries] = useState<IHistoryLogArray[]>([])
    const [commentText, setCommentText] = useState('')

    const [costPerYear, setCostPerYear] = useState(0)
    const [flatCost, setFlatCost] = useState(0)

    const [isDeleted, setIsDeleted] = useState(false)
    const [img, setImg] = useState()
    // const [initialImg, setInitialImg] = useState()

    async function getData() {
        if (match.params.type === 'server') {
            setFirstTableHeaders(['FQDN', 'IP Address', '# of Cores', 'OS', 'RAM'])
            setSecondTableHeaders(['MFG Tag', 'Serial #', 'SAN', 'Local HHD'])
            setThirdTableHeaders(['Employee Assigned', 'Department', 'Location'])
            // make model purchaseDate renewalDate endOfLife virtualized
            setHeadingInfo(['the name', 'another name'])
            await axios
                .get(`/detail/server/${match.params.id}`)
                .then((data: any) => {
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
                        data[0].server.ram + ' GB',
                    ])
                    setSecondTableData([
                        data[0].server.mfg,
                        data[0].server.serialNumber,
                        data[0].server.san,
                        data[0].server.localHHD + ' GB',
                    ])
                    setCostPerYear(data[0].server.costPerYear)
                    setFlatCost(data[0].server.flatCost)

                    // setThirdTableData([data[0].employeeAssignedName, data[0].departmentName, data[0].server.location])
                    setThirdTableData([
                        [
                            data[0].employeeAssignedId
                                ? {
                                      value: data[0].employeeAssignedName,
                                      sortBy: data[0].employeeAssignedName,
                                      id: data[0].employeeAssignedId,
                                      onClick: (id: any) => {
                                          history.push({
                                              pathname: '/employees/detail/' + id,
                                              state: {prev: history.location},
                                          })
                                      },
                                  }
                                : {value: data[0].employeeAssignedName, sortBy: data[0].employeeAssignedName},
                            {
                                value: data[0].departmentName,
                                sortBy: data[0].departmentName,
                                id: data[0].departmentID,
                                onClick: (id: any) => {
                                    history.push({
                                        pathname: '/departments/detail/' + id,
                                        state: {prev: history.location},
                                    })
                                },
                            },
                            {value: data[0].server.location, sortBy: data[0].server.location},
                        ],
                    ])
                    setCommentText(data[0].server.textField)
                    setHistoryLogEntries(data[0].serverHistory)
                    setIsDeleted(data[0].isDeleted)

                    checkImage(data[0].icon, axios, serverPlaceholder)
                        .then(image => setImg(image))
                        .catch(err => console.error(err))
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'laptop' || match.params.type === 'computer') {
            setFirstTableHeaders(['CPU', 'RAM', 'SSD', 'FQDN'])
            setSecondTableHeaders(['Monitor Output', 'Screen Size', 'Serial #', 'MFG Tag'])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            // make model purchaseDate renewalDate endOfLife
            setHeadingInfo(['name', 'the make', 'model name'])
            await axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    setHeadingInfo([
                        'Make: ' + data[0].computer.make,
                        'Model: ' + data[0].computer.model,
                        'Purchase Date: ' + formatDate(data[0].computer.purchaseDate),
                        'Renewal Date: ' + formatDate(data[0].computer.renewalDate),
                        'End of Life: ' + formatDate(data[0].computer.endOfLife),
                    ])
                    setFirstTableData([
                        data[0].computer.cpu,
                        data[0].computer.ramgb + ' GB',
                        data[0].computer.ssdgb + ' GB',
                        data[0].computer.fqdn,
                    ])
                    setSecondTableData([
                        data[0].computer.monitorOutput,
                        data[0].computer.screenSize + ' in',
                        data[0].computer.serialNumber,
                        data[0].computer.mfg,
                    ])
                    setCostPerYear(data[0].computer.costPerYear)
                    setFlatCost(data[0].computer.flatCost)

                    setThirdTableData([
                        [
                            data[0].employeeAssignedId
                                ? {
                                      value: data[0].employeeAssignedName,
                                      sortBy: data[0].employeeAssignedName,
                                      id: data[0].employeeAssignedId,
                                      onClick: (id: any) => {
                                          history.push({
                                              pathname: '/employees/detail/' + id,
                                              state: {prev: history.location},
                                          })
                                      },
                                  }
                                : {value: data[0].employeeAssignedName, sortBy: data[0].employeeAssignedName},
                            {
                                value: data[0].departmentName,
                                sortBy: data[0].departmentName,
                                id: data[0].departmentID,
                                onClick: (id: any) => {
                                    history.push({
                                        pathname: '/departments/detail/' + id,
                                        state: {prev: history.location},
                                    })
                                },
                            },
                            {value: data[0].computer.location, sortBy: data[0].computer.location},
                        ],
                    ])
                    setCommentText(data[0].computer.textField)
                    setHistoryLogEntries(data[0].computerHistory)
                    setIsDeleted(data[0].isDeleted)

                    checkImage(data[0].icon, axios, laptopPlaceholder)
                        .then(image => setImg(image))
                        .catch(err => console.error(err))
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstTableHeaders(['Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondTableHeaders([])
            setThirdTableHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            await axios
                .get(`/detail/monitor/${match.params.id}`)
                .then((data: any) => {
                    setHeadingInfo([
                        'Make: ' + data[0].monitor.make,
                        'Model: ' + data[0].monitor.model,
                        'Purchase Date: ' + formatDate(data[0].monitor.purchaseDate),
                        'Renewal Date: ' + formatDate(data[0].monitor.renewalDate),
                    ])
                    setFirstTableData([
                        data[0].monitor.screenSize + ' in',
                        data[0].monitor.resolution + 'k',
                        data[0].monitor.inputs,
                        data[0].monitor.serialNumber,
                    ])
                    setSecondTableData([])
                    setThirdTableData([
                        [
                            data[0].employeeAssignedId
                                ? {
                                      value: data[0].employeeAssignedName,
                                      sortBy: data[0].employeeAssignedName,
                                      id: data[0].employeeAssignedId,
                                      onClick: (id: any) => {
                                          history.push({
                                              pathname: '/employees/detail/' + id,
                                              state: {prev: history.location},
                                          })
                                      },
                                  }
                                : {value: data[0].employeeAssignedName, sortBy: data[0].employeeAssignedName},
                            {
                                value: data[0].departmentName,
                                sortBy: data[0].departmentName,
                                id: data[0].departmentID,
                                onClick: (id: any) => {
                                    history.push({
                                        pathname: '/departments/detail/' + id,
                                        state: {prev: history.location},
                                    })
                                },
                            },
                            {value: data[0].monitor.location, sortBy: data[0].monitor.location},
                        ],
                    ])
                    setCostPerYear(data[0].monitor.costPerYear)
                    setFlatCost(data[0].monitor.flatCost)
                    setCommentText(data[0].monitor.textField)
                    setHistoryLogEntries(data[0].monitorHistory)
                    setIsDeleted(data[0].isDeleted)

                    checkImage(data[0].icon, axios, monitorPlaceholder)
                        .then(image => setImg(image))
                        .catch(err => console.error(err))
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstTableHeaders([])
            setSecondTableHeaders([])
            setThirdTableHeaders(['Employee Assigned', 'Department Assigned', 'Serial #'])
            await axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    setHeadingInfo([
                        'Name: ' + data[0].peripheral.peripheralName,
                        'Type: ' + data[0].peripheral.peripheralType,
                        'Purchase Date: ' + formatDate(data[0].peripheral.purchaseDate),
                    ])
                    setFirstTableData([])
                    setSecondTableData([])
                    setThirdTableData([
                        [
                            data[0].employeeAssignedId
                                ? {
                                      value: data[0].employeeAssignedName,
                                      sortBy: data[0].employeeAssignedName,
                                      id: data[0].employeeAssignedId,
                                      onClick: (id: any) => {
                                          history.push({
                                              pathname: '/employees/detail/' + id,
                                              state: {prev: history.location},
                                          })
                                      },
                                  }
                                : {value: data[0].employeeAssignedName, sortBy: data[0].employeeAssignedName},
                            {
                                value: data[0].departmentName,
                                sortBy: data[0].departmentName,
                                id: data[0].departmentID,
                                onClick: (id: any) => {
                                    history.push({
                                        pathname: '/departments/detail/' + id,
                                        state: {prev: history.location},
                                    })
                                },
                            },
                            {value: data[0].peripheral.serialNumber, sortBy: data[0].peripheral.serialNumber},
                        ],
                    ])
                    setCostPerYear(data[0].peripheral.costPerYear)
                    setFlatCost(data[0].peripheral.flatCost)
                    setCommentText(data[0].peripheral.textField)
                    setHistoryLogEntries(data[0].peripheralHistory)
                    setIsDeleted(data[0].isDeleted)

                    checkImage(data[0].icon, axios, peripheralPlaceholder)
                        .then(image => setImg(image))
                        .catch(err => console.error(err))
                })
                .catch((err: any) => console.error(err))
        }
    }

    useEffect(() => {
        getData()
    }, [])

    async function handleArchive() {
        if (
            window.confirm(`Are you sure you want to ${isDeleted ? 'recover' : 'archive'} this ${match.params.type}?`)
        ) {
            await axios.put(`${isDeleted ? 'recover' : 'archive'}/${match.params.type}/${match.params.id}`, {})
            history.push({
                pathname: `/hardware${isDeleted ? `/edit/${match.params.type}/${match.params.id}` : ''}`,
                state: {prev: history.location},
            })
        }
    }

    // Returns an arry of the costs to be dislayed.
    function getCosts(): ICostText[] {
        let costTexts: ICostText[] = []
        if (flatCost !== undefined && flatCost !== null && flatCost !== 0) {
            costTexts.push({title: "Initial Cost", cost: `$${flatCost}`})
        }
        if (costPerYear !== undefined && costPerYear !== null && costPerYear !== 0) {
            costTexts.push({title: "Cost Per Year", cost: `$${costPerYear}`})
        }
        return costTexts
    }

    var titleStyle = styles.titleText
    if (match.params.type === 'server') {
        titleStyle = styles.serverTitle
    }

    return (
        <div className={styles.detailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    <DetailImage src={img} />
                    <DetailCostText
                        costTexts={getCosts()}
                    />
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
                                            pathname: '/hardware/edit/' + match.params.type + '/' + match.params.id,
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

                    {/* title/makeModel/dates/virtualized */}
                    <div className={titleStyle}>
                        <div className={styles.hardwareName}>{match.params.type}</div>
                        {headingInfo.map((heading: string) => (
                            <div className={styles.hardwareText}>{heading} </div>
                        ))}
                    </div>

                    {/* <div className={styles.tableContainer}> */}
                    {/* first table */}
                    {firstTableData && firstTableData[0] && (
                        <DetailPageTable
                            headers={firstTableHeaders}
                            rows={[
                                firstTableData.map((datum: string | number) => {
                                    return {value: datum, sortBy: datum}
                                }),
                            ]}
                            setRows={() => {}}
                            sort={false}
                            hover={false}
                            className={styles.detailTable}
                        />
                    )}
                    {/* second table */}
                    {secondTableData && secondTableData[0] && (
                        <DetailPageTable
                            headers={secondTableHeaders}
                            rows={[
                                secondTableData.map((datum: string | number) => {
                                    return {value: datum, sortBy: datum}
                                }),
                            ]}
                            setRows={() => {}}
                            sort={false}
                            hover={false}
                            className={styles.detailTable}
                        />
                    )}
                    {/* third table */}
                    {thirdTableData && thirdTableData[0] && (
                        <DetailPageTable
                            headers={thirdTableHeaders}
                            rows={
                                thirdTableData /*[
                                thirdTableData.map((datum: string | number) => {
                                    return {value: datum, sortBy: datum}
                                }),
                            ]*/
                            }
                            setRows={() => {}}
                            sort={false}
                            hover={false}
                            className={styles.detailTable}
                        />
                    )}
                    {/* </div> */}

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
