import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Packages
import {cloneDeep} from 'lodash'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import ReactTooltip from 'react-tooltip'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

// Utils
import {sortTable} from '../../../utilities/quickSort'
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IEmployeeDetailPageProps {
    match: any
    history: any
}

// Helpers

// Primary Component
export const EmployeeDetailPage: React.SFC<IEmployeeDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<any>({})
    const [hwdata, setHWData] = useState<any[]>([])
    const [swdata, setSWData] = useState<any[]>([])
    const [ldata, setLData] = useState<any[]>([])

    const hwheaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const swheaders = ['Software', 'Key/Username', 'Monthly Cost']
    const lheaders = ['Licenses', 'CALs']

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    useEffect(() => {
        axios
            .get(`/detail/employee/${match.params.id}`)
            .then((data: any) => {
                //console.log(data)
                let user: any = {
                    photo: data[0].picture,
                    name: data[0].firstName + ' ' + data[0].lastName,
                    department: data[0].department,
                    role: data[0].role,
                    hireDate: formatDate(data[0].hireDate),
                    hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    swCost: Math.round(data[0].totalProgramCostPerMonth * 100) / 100,
                }
                setUserData(user)

                let hw: any[] = []
                data[0].hardware.map((i: any) =>
                    hw.push({
                        name: format(i.make + ' ' + i.model),
                        serial: format(i.serialNumber),
                        mfg: format(i.mfg),
                        purchaseDate: formatDate(i.purchaseDate),
                        id: format(i.id),
                        tooltip: i.tooltip.cpu ? formatToolTip(i.tooltip) : '',
                    })
                )
                setHWData(hw)

                let sw: any[] = []
                data[0].software.map((i: any) =>
                    sw.push({
                        name: format(i.name),
                        licenseKey: format(i.licenseKey),
                        costPerMonth: format(Math.round(i.costPerMonth * 100) / 100),
                        flatCost: format(i.flatCost),
                        id: format(i.id),
                    })
                )
                setSWData(sw)

                let l: any[] = []
                data[0].licenses.map((i: any) =>
                    l.push({
                        name: format(i.name),
                        cals: format(i.cals),
                        licenseKey: format(i.licenseKey),
                        costPerMonth: format(Math.round(i.costPerMonth * 100) / 100),
                        flatCost: format(i.flatCost),
                        id: format(i.id),
                    })
                )
                setLData(l)
            })
            .catch((err: any) => console.error(err))
    }, [])

    //-------------- Hardware Table -------------
    var hwtemp: any[] = []
    hwdata.forEach(rowObj => {
        hwtemp.push(Object.values(rowObj))
    })
    const [hwrows, sethwRows] = useState<any[]>(hwtemp)
    useEffect(() => sethwRows(hwtemp), [hwdata])

    const hwheaderStates = []
    const hwheaderStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < hwheaders.length; i++) {
        hwheaderStates.push(styles.notSorted)
        hwheaderStateCounts.push(0)
    }

    var hwinitHeaderStateCounts = cloneDeep(hwheaderStateCounts)
    var hwtempHeaderStates = cloneDeep(hwheaderStates)
    var hwtempHeaderStateCounts = cloneDeep(hwheaderStateCounts)

    var hwinitState = {hwheaderStates, hwheaderStateCounts}
    const [hwsortState, hwsetSortState] = useState(hwinitState)

    function hwsortStates(index: number) {
        if (hwsortState.hwheaderStateCounts[index] == 0) {
            hwtempHeaderStates[index] = styles.descending
            hwtempHeaderStateCounts[index] = 1
            hwsetSortState({hwheaderStates: hwtempHeaderStates, hwheaderStateCounts: hwtempHeaderStateCounts})
            hwtempHeaderStateCounts = [...hwinitHeaderStateCounts]
        } else if (hwsortState.hwheaderStateCounts[index] == 1) {
            hwtempHeaderStates[index] = styles.ascending
            hwtempHeaderStateCounts[index] = 0
            hwsetSortState({hwheaderStates: hwtempHeaderStates, hwheaderStateCounts: hwtempHeaderStateCounts})
            hwtempHeaderStateCounts = [...hwinitHeaderStateCounts]
        }
    }

    const hwrenderHeaders = () => {
        var headers = []

        for (let i = 0; i < hwheaders.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        sethwRows(sortTable(hwrows, i, hwsortState.hwheaderStateCounts[i]))
                        hwsortStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {hwheaders[i]}
                        <div className={hwsortState.hwheaderStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }

        return headers
    }

    const toolTip = (row: any[]) => {
        return (
            <td className={styles.rowData}>
                <a data-tip={row[5]} className={row[5] === '' ? '' : styles.rowTitle}>
                    {row[0]}
                </a>
                <ReactTooltip place='bottom' type='light' effect='float' className={styles.tooltip} />
            </td>
        )
    }

    var hwRenderedRows: any[] = []

    hwrows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = toolTip(row)
                case 1:
                    transformedRow[1] = <td className={styles.rowData}>{row[1]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.rowData}>{row[2]}</td>
                case 3:
                    transformedRow[3] = <td className={styles.rowData}>{row[3]}</td>
            }
        }

        hwRenderedRows.push(transformedRow)
    })

    //-------------- Software Table -------------
    var swtemp: any[] = []
    swdata.forEach(rowObj => {
        swtemp.push(Object.values(rowObj))
    })
    const [swrows, setswRows] = useState<any[]>(swtemp)
    useEffect(() => setswRows(swtemp), [swdata])

    const swheaderStates = []
    const swheaderStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < swheaders.length; i++) {
        swheaderStates.push(styles.notSorted)
        swheaderStateCounts.push(0)
    }

    var swinitHeaderStateCounts = cloneDeep(swheaderStateCounts)
    var swtempHeaderStates = cloneDeep(swheaderStates)
    var swtempHeaderStateCounts = cloneDeep(swheaderStateCounts)

    var swinitState = {swheaderStates, swheaderStateCounts}
    const [swsortState, swsetSortState] = useState(swinitState)

    function swsortStates(index: number) {
        if (swsortState.swheaderStateCounts[index] == 0) {
            swtempHeaderStates[index] = styles.descending
            swtempHeaderStateCounts[index] = 1
            swsetSortState({swheaderStates: swtempHeaderStates, swheaderStateCounts: swtempHeaderStateCounts})
            swtempHeaderStateCounts = [...swinitHeaderStateCounts]
        } else if (swsortState.swheaderStateCounts[index] == 1) {
            swtempHeaderStates[index] = styles.ascending
            swtempHeaderStateCounts[index] = 0
            swsetSortState({swheaderStates: swtempHeaderStates, swheaderStateCounts: swtempHeaderStateCounts})
            swtempHeaderStateCounts = [...swinitHeaderStateCounts]
        }
    }

    const swrenderHeaders = () => {
        var headers = []

        for (let i = 0; i < swheaders.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setswRows(sortTable(swrows, i, swsortState.swheaderStateCounts[i]))
                        swsortStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {swheaders[i]}
                        <div className={swsortState.swheaderStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }

        return headers
    }

    var swRenderedRows: any[] = []

    swrows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = <td className={s(styles.rowData, styles.rowTitle)}>{row[0]} </td>
                case 1:
                    transformedRow[1] = <td className={styles.rowData}>{row[1]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.rowData}>${row[2]}</td>
            }
        }

        swRenderedRows.push(transformedRow)
    })

    //-------------- License Table -------------
    var ltemp: any[] = []
    ldata.forEach(rowObj => {
        ltemp.push(Object.values(rowObj))
    })
    const [lrows, setlRows] = useState<any[]>(ltemp)
    useEffect(() => setlRows(ltemp), [ldata])

    const lheaderStates = []
    const lheaderStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < lheaders.length; i++) {
        lheaderStates.push(styles.notSorted)
        lheaderStateCounts.push(0)
    }

    var linitHeaderStateCounts = cloneDeep(lheaderStateCounts)
    var ltempHeaderStates = cloneDeep(lheaderStates)
    var ltempHeaderStateCounts = cloneDeep(lheaderStateCounts)

    var linitState = {lheaderStates, lheaderStateCounts}
    const [lsortState, lsetSortState] = useState(linitState)

    function lsortStates(index: number) {
        if (lsortState.lheaderStateCounts[index] == 0) {
            ltempHeaderStates[index] = styles.descending
            ltempHeaderStateCounts[index] = 1
            lsetSortState({lheaderStates: ltempHeaderStates, lheaderStateCounts: ltempHeaderStateCounts})
            ltempHeaderStateCounts = [...linitHeaderStateCounts]
        } else if (lsortState.lheaderStateCounts[index] == 1) {
            ltempHeaderStates[index] = styles.ascending
            ltempHeaderStateCounts[index] = 0
            lsetSortState({lheaderStates: ltempHeaderStates, lheaderStateCounts: ltempHeaderStateCounts})
            ltempHeaderStateCounts = [...linitHeaderStateCounts]
        }
    }

    const lrenderHeaders = () => {
        var headers = []

        for (let i = 0; i < lheaders.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setlRows(sortTable(lrows, i, lsortState.lheaderStateCounts[i]))
                        lsortStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {lheaders[i]}
                        <div className={lsortState.lheaderStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }

        return headers
    }

    var lRenderedRows: any[] = []

    lrows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = <td className={s(styles.rowData, styles.rowTitle)}>{row[0]} </td>
                case 1:
                    transformedRow[1] = <td className={styles.rowData}>{row[1]}</td>
            }
        }

        lRenderedRows.push(transformedRow)
    })
    console.log(URL + userData.photo)

    return (
        <div className={styles.empDetailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Employees'
                        icon='back'
                        onClick={() => {
                            history.push('/employees')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + userData.photo} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        <p>Software ---------------- ${userData.swCost} /month</p>
                        <p>Hardware --------------- ${userData.hwCost}</p>
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button text='Edit' icon='edit' onClick={() => {}} className={styles.editbutton} />

                            <Button text='Archive' icon='archive' onClick={() => {}} className={styles.archivebutton} />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.employeeName}>{userData.name}</div>
                        <div className={styles.employeeText}>
                            {userData.department} | {userData.role}
                        </div>
                        <div className={styles.employeeText}>
                            Hired: {userData.hireDate} | {calculateDaysEmployed(getDays(userData.hireDate))}
                        </div>
                    </div>
                    <DetailPageTable headers={hwrenderHeaders()} rows={hwRenderedRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new hardware'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}

                    <DetailPageTable headers={swrenderHeaders()} rows={swRenderedRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new software'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}

                    <DetailPageTable headers={lrenderHeaders()} rows={lRenderedRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new license'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
