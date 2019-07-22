import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {IoIosArrowRoundUp, IoIosArrowRoundDown, IoIosStats} from 'react-icons/io'
//import {TiPin} from 'react-icons/ti'

// Styles
import styles from './DashboardPage.module.css'

// Components
import {Dropdown, IDropdownItem} from '../../reusables/Dropdown/Dropdown'
import {Card} from '../../reusables/Card/Card'
import {Group} from '../../reusables/Group/Group'
import {HorizontalBarChart} from '../../reusables/HorizontalBarChart/HorizontalBarChart'
import {DashboardTable, IDashboardTableDatum} from '../../reusables/DashboardTable/DashboardTable'
import {RechartPieChart, IPieDataProps} from '../../reusables/PieChart/PieChart'
import {CostCard} from '../Dashboard/CostCard/CostCard'
import {History} from 'history'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IDashboardPageProps {
    history: History
}

// Initial props
let initLicenses: {
    programName: string
    countProgInUse: number
    countProgOverall: number
}[] = []
let initSoftwareTableData: IDashboardTableDatum[] = [{name: 'Init', numberOf: 5, costPerMonth: 5, projected: '*'}]
let initCosts: {
    costOfProgramsPerYear: number
    costOfPluginsPerYear: number
} = {
    costOfProgramsPerYear: 0,
    costOfPluginsPerYear: 0,
}
let initPieData: IPieDataProps[] = [
    {
        headingName: 'Software',
        data: [
            {name: 'one', value: 0, id: ''},
            {name: 'two', value: 0, id: ''},
            {name: 'three', value: 0, id: ''},
            {name: 'four', value: 0, id: ''},
        ],
    },
    {
        headingName: 'Hardware',
        data: [
            {name: 'one', value: 0, id: ''},
            {name: 'two', value: 0, id: ''},
            {name: 'three', value: 0, id: ''},
            {name: 'four', value: 0, id: ''},
        ],
    },
]

let initDeptTable: {id: number; name: string; tableData: IDashboardTableDatum[]}[] = [
    {
        id: -1,
        name: 'Select a Department',
        tableData: [],
    },
]

// Primary Component
export const DashboardPage: React.FC<IDashboardPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    //Liscence Bar Chart State
    const [licenses, setLicenses] = useState(initLicenses)

    //Software Table State
    const [softwareTableData, setSoftwareTableData] = useState(initSoftwareTableData)

    //Cost Card State
    const [costs, setCosts] = useState(initCosts)

    //Pie State
    const [pieData, setPieData] = useState(initPieData)

    //Department Tables State
    const [deptList, setDeptList] = useState<{DepartmentName: string; DepartmentId: number}[]>([])
    const [deptTableData, setDeptTableData] = useState<{id: number; name: string; tableData: IDashboardTableDatum[]}[]>(
        [
            {
                //TODO: in order for dropdown to have default this needs to be hardcoded with a dept that always exists
                id: -1,
                name: 'Select A Department',
                tableData: [],
            },
        ]
    )
    const [dropdownContent, setDropdownContent] = useState<IDropdownItem[]>([])
    const [selectedDeptTable, setSelectedDeptTable] = useState<IDropdownItem>({...deptTableData[0]})

    //Click Handling
    const onRowClick = (datum: IDashboardTableDatum) => {
        if (datum.name[datum.name.length - 1] === '*') {
            var str = datum.name.substring(0, datum.name.length - 1)
            history.push(`/programs/overview/${str}/inventory`)
        } else {
            history.push(`/programs/overview/${datum.name}/inventory`)
        }
    }

    const onBarClick = (id: string) => {
        history.push(`/programs/overview/${id}/inventory`)
    }

    const onSliceClick = (id: string) => {
        history.push(`/departments/detail/${id}`)
    }

    const getDeptTables = () => {
        initDeptTable = []
        deptList &&
            deptList.map(i =>
                axios
                    .get(`/dashboard/departmentTable/${i.DepartmentId}`)
                    .then((data: any[]) => {
                        let y: IDashboardTableDatum[] = []
                        data &&
                            data.map((datum: any) =>
                                y.push({
                                    name: datum.programName,
                                    numberOf: datum.programCount,
                                    costPerMonth: datum.programCostPerYear / 12,
                                    projected: datum.programIsCostPerYear ? '' : '*',
                                })
                            )
                        initDeptTable.push({id: i.DepartmentId, name: i.DepartmentName, tableData: y})
                    })
                    .catch((err: any) => console.error(err))
            )
        setDeptTableData(initDeptTable)
    }

    const updateDropdownContent = () => {
        let x: any[] = []

        deptTableData.map((i: any) =>
            x.push({
                id: i.id,
                name: i.name,
            })
        )
        setDropdownContent(x)
    }

    useEffect(() => {
        axios
            .get('/dashboard/licenseTable')
            .then((data: any) => {
                setLicenses(data)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/dashboard/softwareTable')
            .then((data: any) => {
                let x: IDashboardTableDatum[] = []
                data &&
                    data.map((i: any) =>
                        x.push({
                            name: i.isPinned ? i.softwareName + '*' : i.softwareName + '',
                            numberOf: i.numberOfUsers,
                            costPerMonth: i.costPerMonth,
                            projected: i.isProjected ? '*' : '',
                        })
                    )
                setSoftwareTableData(x)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/dashboard/CostBreakdown')
            .then((data: any) => {
                data && setCosts(data[0])
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/dashboard/CostPieCharts')
            .then((data: any) => {
                let x: IPieDataProps[] = [
                    {
                        headingName: data[0].headingName,
                        data: [],
                    },
                    {
                        headingName: data[1].headingName,
                        data: [],
                    },
                ]
                data[0].dataForPrograms &&
                    data[0].dataForPrograms.map((i: any) =>
                        x[0].data.push({
                            name: i.departmentName,
                            value: i.costOfPrograms !== null ? i.costOfPrograms : 0,
                            id: i.departmentId,
                        })
                    )

                data[1].dataForHardware &&
                    data[1].dataForHardware.map((i: any) =>
                        x[1].data.push({
                            name: i.departmentName,
                            value: i.costOfHardware !== null ? i.costOfHardware : 0,
                            id: i.departmentId,
                        })
                    )
                setPieData(x)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/dashboard/departmentTable?$select=departmentName,departmentID')
            .then((data: any) => {
                setDeptList(data)
                data &&
                    data[0] &&
                    data[0].DepartmentName &&
                    setSelectedDeptTable({name: data[0].DepartmentName, id: data[0].DepartmentId})
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(getDeptTables, [deptList])
    useEffect(updateDropdownContent, [deptTableData, getDeptTables, dropdownContent])

    const displayDeptTable = () => {
        const table = deptTableData.filter(i => i.id === selectedDeptTable.id)

        return table.length > 0 ? (
            <div className={styles.software}>
                <DashboardTable data={table[0].tableData} onRowClick={onRowClick} />
                <div className={styles.softwareKey}>
                    <div>Cost Per Year* = Projected</div>
                </div>
            </div>
        ) : (
            <div></div>
        )
    }

    return (
        <div className={styles.dashMain}>
            <div className={styles.dashColumn}>
                <Card
                    title={'licenses'}
                    titleClassName={styles.linkedTitle}
                    titleOnClick={() => {
                        history.push('/programs')
                    }}
                >
                    <Group>
                        {licenses &&
                            licenses.map(i => (
                                <HorizontalBarChart
                                    key={i.programName}
                                    title={i.programName}
                                    amount={i.countProgInUse}
                                    outOf={i.countProgOverall}
                                    onClick={onBarClick}
                                />
                            ))}
                    </Group>
                </Card>

                <div className={styles.dashRow}>
                    <CostCard
                        cardTitle='Yearly Cost'
                        data={{
                            programsCost: costs.costOfProgramsPerYear,
                            pluginsCost: costs.costOfPluginsPerYear,
                        }}
                        icon={
                            <span>
                                <IoIosArrowRoundUp className={styles.upArrowIcon} />
                                <IoIosArrowRoundDown className={styles.downArrowIcon} />
                            </span>
                        }
                    />
                    <CostCard
                        cardTitle='Monthly Cost'
                        data={{
                            programsCost: costs.costOfProgramsPerYear / 12,
                            pluginsCost: costs.costOfPluginsPerYear / 12,
                        }}
                        icon={<IoIosStats className={styles.statsIcon} />}
                    />
                </div>
                <Card>
                    {dropdownContent && (
                        <Dropdown
                            content={dropdownContent}
                            titleClassName={styles.linkedTitle}
                            selected={selectedDeptTable}
                            setSelected={setSelectedDeptTable}
                        />
                    )}
                    {deptTableData[0] && displayDeptTable()}
                </Card>
            </div>

            <div className={styles.dashColumn}>
                <Card
                    title={'Departments'}
                    titleClassName={styles.linkedTitle}
                    titleOnClick={() => {
                        history.push('/departments')
                    }}
                >
                    <RechartPieChart
                        pieChartData={pieData}
                        initialColors={[
                            '#B72160',
                            '#009EFF',
                            '#FF8A5B',
                            '#EA526F',
                            '#2EC4B6',
                            '#0B4F6C',
                            '#8A3A91',
                            '#2266B0',
                            '#fcfa74',
                            '#1b5159',
                            '#1d6332',
                        ]}
                        onSliceClick={onSliceClick}
                    />
                </Card>
                <Card
                    title={'software'}
                    titleClassName={styles.linkedTitle}
                    titleOnClick={() => {
                        history.push('/programs')
                    }}
                >
                    <div className={styles.software}>
                        <DashboardTable data={softwareTableData} onRowClick={onRowClick} />
                        <div className={styles.softwareKey}>
                            <div>Name* = Pinned</div>
                            <div>Cost Per Year* = Projected</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
