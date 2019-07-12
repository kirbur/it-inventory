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

// Types
interface IHardwareDetailEditPageProps {
    history: any
    match: any
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
    const [headingInfo, setHeadingInfo] = useState<(string | number)[]>(['something aint right'])

    const [firstSectionData, setFirstSectionData] = useState<(string | number)[]>([])
    const [secondSectionData, setSecondSectionData] = useState<(string | number)[]>([])
    const [thirdSectionData, setThirdSectionData] = useState<(string | number)[]>([])

    const [purchaseDateInput, setPurchaseDateInput] = useState<Date>(new Date())
    const [renewalDateInput, setRenewalDateInput] = useState<Date>(new Date())
    const [endOfLifeInput, setEndOfLifeInput] = useState<Date>(new Date())

    const [commentText, setCommentText] = useState('')

    const [historyLogEntries, setHistoryLogEntries] = useState<any[]>([])
    const [eventInput, setEventInput] = useState('')
    const [historyLogBool, setHistoryLogBool] = useState(false)
    const [dateInput, setDateInput] = useState<Date>(new Date())

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
                    setSecondSectionData([])
                    setPurchaseDateInput(data[0].server.purchaseDate)
                    setRenewalDateInput(data[0].server.renewalDate)
                    setEndOfLifeInput(data[0].server.endOfLife)

                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].server.location])
                    setCommentText(data[0].server.textField)
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
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Department Assigned', 'Location'])
            axios
                .get(`/detail/computer/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([
                        data[0].computer.make,
                        data[0].computer.model,
                        data[0].computer.cpu,
                        data[0].computer.ramgb,
                        data[0].computer.ssdgb,
                        data[0].computer.screenSize,
                        data[0].computer.monitorOutput,
                        data[0].computer.serialNumber,
                        data[0].computer.fqdn,
                    ])
                    setSecondSectionData([])
                    setPurchaseDateInput(data[0].computer.purchaseDate)
                    setRenewalDateInput(data[0].computer.renewalDate)
                    setEndOfLifeInput(data[0].computer.endOfLife)

                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD', data[0].computer.location])
                    setCommentText(data[0].computer.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'monitor') {
            setFirstSectionHeaders(['Make', 'Model', 'Screen Size', 'Resolution', 'Inputs', 'Serial #'])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date'])
            setThirdSectionHeaders(['Employee Assigned', 'Dept Assigned'])
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

                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD'])
                    setCommentText(data[0].monitor.textField)
                })
                .catch((err: any) => console.error(err))
        } else if (match.params.type === 'peripheral') {
            setFirstSectionHeaders(['Employee Assigned', 'Serial #'])
            setSecondSectionHeaders(['Purchase Date'])
            setThirdSectionHeaders([])
            axios
                .get(`/detail/peripheral/${match.params.id}`)
                .then((data: any) => {
                    console.log(data)
                    setFirstSectionData([data[0].employeeAssignedName, data[0].peripheral.serialNumber])
                    setPurchaseDateInput(data[0].peripheral.purchaseDate)

                    setSecondSectionData([])
                    setThirdSectionData([data[0].employeeAssignedName, 'NEED TO ADD'])
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
    const handleSubmit = () => {}

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
                                <input type='text' className={styles.input} placeholder={sectionData[i]}></input>
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <input type='text' className={styles.input} placeholder={sectionData[i + 1]}></input>
                            </div>
                        )}
                        {sectionHeaders[i + 2] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                                <input type='text' className={styles.input} placeholder={sectionData[i + 2]}></input>
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
    const submitHistoryLog = () => {
        console.log(eventInput)
        if (eventInput === 'Broken' || eventInput === 'Repaired') {
            console.log(eventInput)
            setHistoryLogBool(!historyLogBool)
            let tempHistoryLog = cloneDeep(historyLogEntries)
            tempHistoryLog.push({
                user: thirdSectionData[0],
                event: eventInput,
                date: formatDate(dateInput.toString()),
            })
            setHistoryLogEntries(tempHistoryLog)
        } else {
            window.alert('Need to choose an event!')
        }
        // TODO: post the entry to the db - wil post one at a time
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
                        <div className={styles.radio}>
                            <input
                                type='checkbox'
                                className={styles.checkmark}
                                // checked={state.costType === 'per month'}
                                // onChange={() => setState({...state, costType: 'per month'})}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputHeader}>Initial Cost</div>
                            <input
                                className={s(styles.radioInput, styles.costInput)}
                                type='number'
                                step='0.01'
                                // value={state.costPerMonth}
                                // onChange={cost => setState({...state, costPerMonth: parseFloat(cost.target.value)})}
                            />
                        </div>
                    </div>
                    <div className={styles.radioContainer}>
                        <div className={styles.radio}>
                            <input
                                type='checkbox'
                                className={styles.checkmark}
                                // checked={state.costType === 'per year'}
                                // onChange={() => setState({...state, costType: 'per year'})}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputHeader}>Cost per Year</div>
                            <input
                                className={s(styles.radioInput, styles.costInput)}
                                type='number'
                                step='0.01'
                                // value={state.costPerYear}
                                // onChange={cost => setState({...state, costPerYear: parseFloat(cost.target.value)})}
                            />
                        </div>
                    </div>
                </div>

                {/* history log - will post separately from the rest of the hardware*/}
                <div className={styles.historyLogContainer}>
                    <HistoryLog historyLog={historyLogEntries} />
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
                                <Button icon='add' onClick={submitHistoryLog} className={styles.historyLogButton} />
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
