import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'
import DatePicker from 'react-datepicker'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './HardwareDetailEditPage.module.css'

// Context
import {LoginContext} from '../../App/App'
import {cloneDeep} from 'lodash'
import {handleInputChange} from 'react-select/lib/utils'

// Types
interface IHardwareDetailEditPageProps {
    history: any
    match: any
}
export interface MonitorData {
    Make: string
    Model: string
    ScreenSize: number
    Resolution: number
    Inputs: number
    SerialNumber: number

    Location: string
    EmployeeId: number

    RenewalDate: Date
    PurchaseDate: Date

    FlatCost: number
    CostPerYear: number
    MonthsPerRenewal: number
    Mfg: null
    TextField: string
}

// Primary Component
export const HardwareDetailEditPage: React.SFC<IHardwareDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [hardwareData, setUserData] = useState<any>({})

    //default
    const [firstSectionHeaders, setFirstSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [secondSectionHeaders, setSecondSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [thirdSectionHeaders, setThirdSectionHeaders] = useState<string[]>(['yeah something went wrong'])

    const [firstSectionData, setFirstSectionData] = useState<(string | number)[]>([])
    // var returnFirstSectionData = {}
    const [secondSectionData, setSecondSectionData] = useState<(string | number)[]>([])
    const [thirdSectionData, setThirdSectionData] = useState<(string | number)[]>([])
    const [costSection, setCostSection] = useState<(number | string)[]>([])

    const [purchaseDateInput, setPurchaseDateInput] = useState<Date>(new Date())
    const [renewalDateInput, setRenewalDateInput] = useState<Date>(new Date())
    const [endOfLifeInput, setEndOfLifeInput] = useState<Date>(new Date())

    const [commentText, setCommentText] = useState('')

    const [historyLogEntries, setHistoryLogEntries] = useState<any[]>([])
    const [addHistoryLog, setAddHistoryLog] = useState<any[]>([])
    const [removeHistoryLog, setRemoveHistoryLog] = useState<any[]>([])
    const [eventInput, setEventInput] = useState<'Broken' | 'Repaired'>()
    const [historyLogBool, setHistoryLogBool] = useState(false)
    const [dateInput, setDateInput] = useState<Date>(new Date())

    const [isRecurring, setIsRecurring] = useState(false)

    const [hasRecurringCost, setHasRecurringCost] = useState(false)
    const [hasFlatCost, setHasFlatCost] = useState(false)

    useEffect(() => {
        if (match.params.type === 'server') {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'OS',
                'RAM',
                'Local HHD',
                '# of Cores',
                'MFG Tag',
                'Serial #',
                'IP Address',
                'SAN',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Department Assigned', 'Location'])
            axios
                .get(`/detail/server/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    // let pull = data[0].server
                    setFirstSectionData([
                        data[0].server.make,
                        data[0].server.model,
                        data[0].server.operatingSystem,
                        data[0].server.ram,
                        data[0].server.localHHD,
                        data[0].server.numberOfCores,
                        data[0].server.mfg,
                        data[0].server.serialNumber,
                        data[0].server.ipAddress,
                        data[0].server.san,
                        data[0].server.fqdn,
                    ])
                    // returnFirstSectionData = {
                    //     make: pull.make,
                    //     model: pull.model,
                    //     os: pull.operatingSystem,
                    //     ram: pull.ram,
                    //     hhd: pull.localHHD,
                    //     cores: pull.numberOfCores,
                    //     mfg: pull.mfg,
                    //     serialNumber: pull.serialNumber,
                    //     ip: pull.ipAddress,
                    //     san: pull.san,
                    //     fqdn: pull.fqdn,
                    // }
                    // setFirstSectionData(Object.values(returnFirstSectionData)) //turns to array
                    setSecondSectionData([])
                    setPurchaseDateInput(data[0].server.purchaseDate)
                    setRenewalDateInput(data[0].server.renewalDate)
                    setEndOfLifeInput(data[0].server.endOfLife)
                    setThirdSectionData([
                        data[0].employeeAssignedName,
                        data[0].departmentName,
                        data[0].server.location,
                        data[0].server.employeeId,
                    ])
                    setCostSection([
                        data[0].server.flatCost,
                        data[0].server.costPerYear,
                        data[0].server.monthsPerRenewal,
                    ])
                    setCommentText(data[0].server.textField)
                    setHistoryLogEntries(data[0].serverHistory)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === ('laptop' || 'computer')) {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'CPU',
                'RAM',
                'SSD',
                'Screen Size',
                'Monitor Output',
                'Serial #',
                'MFG Tag',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Department Assigned', 'Location'])
            axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    console.log(data[0].computerHistory)
                    setFirstSectionData([
                        data[0].computer.make,
                        data[0].computer.model,
                        data[0].computer.cpu,
                        data[0].computer.ramgb,
                        data[0].computer.ssdgb,
                        data[0].computer.screenSize,
                        data[0].computer.monitorOutput,
                        data[0].computer.serialNumber,
                        data[0].computer.mfg,
                        data[0].computer.fqdn,
                    ])

                    setSecondSectionData([])
                    setPurchaseDateInput(data[0].computer.purchaseDate)
                    setRenewalDateInput(data[0].computer.renewalDate)
                    setHistoryLogEntries(data[0].computerHistory)
                    setEndOfLifeInput(data[0].computer.endOfLife)

                    setThirdSectionData([
                        data[0].employeeAssignedName,
                        data[0].departmentName,
                        data[0].computer.location,
                        data[0].computer.employeeId,
                    ])
                    setCommentText(data[0].computer.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstSectionHeaders(['Make', 'Model', 'Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date'])
            setThirdSectionHeaders(['Employee Assigned', 'Dept Assigned', 'Location'])
            axios
                .get(`/detail/monitor/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].monitor.make,
                        data[0].monitor.model,
                        data[0].monitor.screenSize,
                        data[0].monitor.resolution,
                        data[0].monitor.inputs,
                        data[0].monitor.serialNumber,
                    ])
                    setSecondSectionData([])
                    setPurchaseDateInput(data[0].monitor.purchaseDate)
                    setRenewalDateInput(data[0].monitor.renewalDate)

                    setThirdSectionData([
                        data[0].employeeAssignedName,
                        data[0].departmentName,
                        data[0].monitor.location,
                        data[0].monitor.employeeId,
                    ])
                    setCommentText(data[0].monitor.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstSectionHeaders(['Name', 'Type', 'Employee Assigned', 'Serial #', ''])
            setSecondSectionHeaders(['Purchase Date'])
            setThirdSectionHeaders([])
            axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].peripheral.peripheralName,
                        data[0].peripheral.peripheralType,
                        data[0].employeeAssignedName,
                        data[0].peripheral.serialNumber,
                    ])
                    setPurchaseDateInput(data[0].peripheral.purchaseDate)

                    setSecondSectionData([])
                    setThirdSectionData([
                        data[0].employeeAssignedName,
                        data[0].departmentName,
                        data[0].peripheral.location,
                        data[0].peripheral.employeeId,
                    ])
                    setCommentText(data[0].peripheral.textField)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    async function handleSubmit() {
        if (match.params.id === 'new') {
            if (match.params.type === 'monitor') {
                await axios.post(`add/monitor`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        ScreenSize: firstSectionData[2],
                        Resolution: firstSectionData[3],
                        Inputs: firstSectionData[4],
                        SerialNumber: firstSectionData[5],

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],
                        Mfg: null,
                        TextField: commentText,
                    },
                })
            } else if (match.params.type === 'server') {
                await axios.post(`add/server`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        OperatingSystem: firstSectionData[2],
                        Ram: firstSectionData[3],
                        LocalHHD: firstSectionData[4],
                        NumberOfCores: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        IPAddress: firstSectionData[8],
                        SAN: firstSectionData[9],
                        Fqdn: firstSectionData[10],

                        Virtualize: false, //NEED TO ADD THIS

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                })
            } else if (match.params.type === 'laptop') {
                await axios.post(`add/laptop`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        Cpu: firstSectionData[2],
                        Ssdgb: firstSectionData[3],
                        ScreenSize: firstSectionData[4],
                        MonitorOutput: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        Fqdn: firstSectionData[10],

                        Virtualize: false, //NEED TO ADD THIS

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                })
            } else if (match.params.type === 'peripheral') {
                await axios.post(`add/peripheral`, {
                    Entity: {
                        PeripheralName: firstSectionData[0],
                        PeripheralType: firstSectionData[1],
                        Mfg: null,
                        SerialNumber: firstSectionData[3],

                        PurchaseDate: purchaseDateInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                })
            }
            history.push('/hardware')
        } else {
            console.log('check')
            //not new --> editing existing page
            if (match.params.type === 'monitor') {
                await axios.put(`update/monitor`, {
                    Entity: {
                        MonitorId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        ScreenSize: firstSectionData[2],
                        Resolution: firstSectionData[3],
                        Inputs: firstSectionData[4],
                        SerialNumber: firstSectionData[5],

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],
                        Mfg: null,
                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: [],
                })
            } else if (match.params.type === 'server') {
                await axios.put(`update/server`, {
                    Entity: {
                        ServerId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        OperatingSystem: firstSectionData[2],
                        Ram: firstSectionData[3],
                        LocalHHD: firstSectionData[4],
                        NumberOfCores: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        IPAddress: firstSectionData[8],
                        SAN: firstSectionData[9],
                        Fqdn: firstSectionData[10],

                        Virtualize: false, //NEED TO ADD THIS

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: [],
                })
            } else if (match.params.type === 'laptop') {
                console.log('check')
                await axios.put(`update/computer`, {
                    Entity: {
                        ComputerId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        Cpu: firstSectionData[2],
                        Ssdgb: firstSectionData[3],
                        ScreenSize: firstSectionData[4],
                        MonitorOutput: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        Fqdn: firstSectionData[10],

                        Virtualize: false, //NEED TO ADD THIS

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: [],
                })
            } else if (match.params.type === 'peripheral') {
                await axios.put(`update/peripheral`, {
                    Entity: {
                        PeripheralId: match.params.id,

                        PeripheralName: firstSectionData[0],
                        PeripheralType: firstSectionData[1],
                        Mfg: null,
                        SerialNumber: firstSectionData[3],

                        PurchaseDate: purchaseDateInput,

                        Location: thirdSectionData[2],
                        EmployeeId: thirdSectionData[3],

                        FlatCost: costSection[0],
                        CostPerYear: costSection[1],
                        MonthsPerRenewal: costSection[2],

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: [],
                })
            }
        }

        console.log(addHistoryLog)
        history.push('/hardware')
    }

    function handleInputChange(index: number, sectionData: any[], value: string | number) {
        let tempData = cloneDeep(sectionData)
        tempData[index] = value
        if (sectionData == firstSectionData) {
            setFirstSectionData(tempData)
        } else if (sectionData == secondSectionData) {
            setSecondSectionData(tempData)
        } else if (sectionData == thirdSectionData) {
            setThirdSectionData(tempData)
        }
        console.log(firstSectionData)
    }

    // make first section
    function renderSection(sectionHeaders: string[], sectionData: any[]) {
        var rows = []
        if (sectionData == secondSectionData) {
            for (let i = 0; i < sectionHeaders.length; i += 3) {
                rows.push(
                    <div className={styles.row}>
                        {sectionHeaders[i] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(purchaseDateInput)}
                                    onChange={e => e && setPurchaseDateInput(e)}
                                    className={styles.input}
                                />
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(renewalDateInput)}
                                    onChange={e => e && setRenewalDateInput(e)}
                                    className={styles.input}
                                />
                            </div>
                        )}
                        {sectionHeaders[i + 2] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(endOfLifeInput)}
                                    onChange={e => e && setEndOfLifeInput(e)}
                                    className={styles.input}
                                />
                            </div>
                        )}
                    </div>
                )
            }
        } else {
            for (let i = 0; i < sectionHeaders.length; i += 3) {
                rows.push(
                    <div className={styles.row}>
                        {sectionHeaders[i] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    placeholder={sectionData[i]}
                                    onChange={e => e && handleInputChange(i, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    placeholder={sectionData[i + 1]}
                                    onChange={e => e && handleInputChange(i + 1, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                        {sectionHeaders[i + 2] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    placeholder={sectionData[i + 2]}
                                    onChange={e => e && handleInputChange(i + 2, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                    </div>
                )
            }
        }

        return <div className={styles.section}>{rows}</div>
    }

    const toggleHistoryLogForm = () => {
        setHistoryLogBool(!historyLogBool)
    }
    const handleSubmitHistoryLog = () => {
        if (eventInput === 'Broken' || eventInput === 'Repaired') {
            setHistoryLogBool(!historyLogBool)
            let tempHistoryLog = new Array()
            if (historyLogEntries !== undefined) {
                tempHistoryLog = cloneDeep(historyLogEntries)
            }
            console.log(tempHistoryLog)
            tempHistoryLog.push({
                employeeName: thirdSectionData[0],
                eventType: eventInput,
                eventDate: dateInput,
            })

            //adding to add history log to send to backend
            setHistoryLogEntries(tempHistoryLog)
            tempHistoryLog = cloneDeep(addHistoryLog)
            tempHistoryLog.push({
                EventType: eventInput,
                EventDate: dateInput.toISOString(),
            })
            setAddHistoryLog(tempHistoryLog)
        } else {
            window.alert('Need to choose an event!')
        }
        console.log(addHistoryLog)
    }

    function removeLog(index: number) {
        let tempHistoryLog = cloneDeep(historyLogEntries)
        console.log(tempHistoryLog)
        tempHistoryLog = tempHistoryLog.slice(0, index).concat(tempHistoryLog.slice(index + 1, tempHistoryLog.length))
        console.log(tempHistoryLog)
        setHistoryLogEntries(tempHistoryLog)
    }
    const handleRemoveHistoryLog = () => {}

    const changeCost = (value: string, index: number) => {
        let tempArray = cloneDeep(costSection)
        tempArray[index] = value
        setCostSection(tempArray)
    }

    return (
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
                <div className={styles.costText}></div>
            </div>

            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={styles.hardwareHeader}>{match.params.type} Information</div>
                {/* virtualize checkbox */}
                <div></div>
                {/* first section */}
                {firstSectionHeaders.length > 0 && renderSection(firstSectionHeaders, firstSectionData)}
                {firstSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* second section */}
                {secondSectionHeaders.length > 0 && renderSection(secondSectionHeaders, secondSectionData)}
                {secondSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* third section */}
                {thirdSectionHeaders.length > 0 && renderSection(thirdSectionHeaders, thirdSectionData)}
                {thirdSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* cost section */}
                <div className={styles.radioSection}>
                    <div className={styles.radioContainer}>
                        <div className={s(styles.radio, styles.marginTop)}>
                            <input
                                type='checkbox'
                                className={styles.checkmark}
                                // checked={hasFlatCost}
                                // checked={state.costType === 'per month'}
                                // onChange={() => setState({...state, costType: 'per month'})}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputHeader}>Initial Cost</div>
                            <input
                                className={styles.radioInput}
                                type='number'
                                step='0.01'
                                value={costSection[0]}
                                onChange={e => changeCost(e.target.value, 0)}
                            />
                        </div>
                    </div>
                    <div className={styles.radioContainer}>
                        <div className={s(styles.radio, styles.marginTop)}>
                            <input
                                type='checkbox'
                                className={styles.checkmark}
                                onChange={() => setIsRecurring(!isRecurring)}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputHeader}>Recurring Cost</div>
                            <input
                                className={styles.radioInput}
                                type='number'
                                step='0.01'
                                value={costSection[1]}
                                onChange={e => changeCost(e.target.value, 1)}
                            />
                        </div>
                        {isRecurring && (
                            <div className={styles.marginLeft}>
                                <div className={styles.inputHeader}>Months per Renewal</div>
                                <input
                                    className={styles.monthsInput}
                                    type='number'
                                    step='1'
                                    value={costSection[2]}
                                    onChange={e => changeCost(e.target.value, 2)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.historyLogContainer}>
                    <HistoryLog historyLog={historyLogEntries} remove={removeLog} />
                    {historyLogBool && (
                        <div className={styles.row}>
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>Date</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={dateInput}
                                    onChange={e => e && setDateInput(e)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>Event Type</div>
                                <div className={styles.radioContainer}>
                                    <div className={styles.radio}>
                                        <input
                                            type='radio'
                                            name='event'
                                            className={styles.checkmark}
                                            checked={eventInput === 'Broken'}
                                            onChange={() => setEventInput('Broken')}
                                        />
                                        <div className={styles.checkmark} />
                                        <div className={styles.insideCheckmark} />
                                    </div>
                                    <div className={styles.inputHeader}>Broken</div>
                                </div>
                                <div className={styles.radioContainer}>
                                    <div className={styles.radio}>
                                        <input
                                            type='radio'
                                            name='event'
                                            className={styles.checkmark}
                                            checked={eventInput === 'Repaired'}
                                            onChange={() => setEventInput('Repaired')}
                                        />
                                        <div className={styles.checkmark} />
                                        <div className={styles.insideCheckmark} />
                                        <div className={styles.inputHeader}>Repaired</div>
                                    </div>
                                </div>
                                {/* the rest of the logs are done on the backend */}
                            </div>
                            {/* should send back the employee of this page */}
                            <div className={styles.historyLogSubmit}>
                                <Button
                                    icon='add'
                                    onClick={handleSubmitHistoryLog}
                                    className={styles.historyLogButton}
                                />
                                Submit Log
                            </div>
                        </div>
                    )}
                    {!historyLogBool && (
                        <div className={styles.historyLogAdd}>
                            <Button icon='add' onClick={toggleHistoryLogForm} className={styles.historyLogButton} />
                            add log
                        </div>
                    )}
                </div>

                {/* comment section */}
                <div>
                    <div className={styles.header}>Text Field</div>

                    <textarea
                        className={styles.description}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    ></textarea>
                </div>
                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
