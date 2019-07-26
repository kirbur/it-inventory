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
    const {loginContextVariables} = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)

    //Liscence Bar Chart State
    const [licenses, setLicenses] = useState(initLicenses)

    //Software Table State
    const [softwareTableData, setSoftwareTableData] = useState(initSoftwareTableData)

    //Cost Card State
    const [costs, setCosts] = useState(initCosts)

    //Pie State
    const [pieData, setPieData] = useState(initPieData)

    //Department Tables State
    const [deptTableData, setDeptTableData] = useState<{id: number; name: string; tableData: IDashboardTableDatum[]}[]>(
        []
    )
    const [dropdownContent, setDropdownContent] = useState<IDropdownItem[]>([])
    const [selectedDept, setSelectedDept] = useState<IDropdownItem>({id: -1, name: 'Select A Department'})
    const [selectedDeptTable, setSelectedDeptTable] = useState<IDashboardTableDatum[]>([])

    //Click Handling
    const onRowClick = (datum: IDashboardTableDatum) => {
        if (datum.name[datum.name.length - 1] === '*') {
            var str = datum.name.substring(0, datum.name.length - 1)
            history.push({pathname: `/programs/overview/${str}/inventory`, state: {prev: history.location}})
        } else {
            history.push({pathname: `/programs/overview/${datum.name}/inventory`, state: {prev: history.location}})
        }
    }

    const onBarClick = (id: string) => {
        history.push({pathname: `/programs/overview/${id}/inventory`, state: {prev: history.location}})
    }

    const onSliceClick = (id: string) => {
        history.push({pathname: `/departments/detail/${id}`, state: {prev: history.location}})
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
                setDropdownContent([
                    ...data.map((datum: any) => {
                        return {id: datum.DepartmentId, name: datum.DepartmentName}
                    }),
                ])

                data &&
                    data[0] &&
                    data[0].DepartmentName &&
                    setSelectedDept({name: data[0].DepartmentName, id: data[0].DepartmentId})
            })
            .catch((err: any) => console.error(err))
    }, [])

    async function getDeptTables() {
        var deptTables: any[] = []
        await dropdownContent.map(i => {
            axios
                .get(`/dashboard/departmentTable/${i.id}`)
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
                    deptTables.push({id: i.id, name: i.name, tableData: y})

                    if (i.id === selectedDept.id) {
                        setSelectedDeptTable(y)
                    }
                })
                .catch((err: any) => console.error(err))
        })

        setDeptTableData(deptTables)
    }

    useEffect(() => {
        getDeptTables()
    }, [dropdownContent, selectedDept])

    return (
        <div className={styles.dashMain}>
            <div className={styles.dashColumn}>
                <Card
                    title={'licenses'}
                    titleClassName={styles.linkedTitle}
                    titleOnClick={() => {
                        history.push({pathname: `/programs`, state: {prev: history.location}})
                    }}
                >
                    <Group className={styles.group}>
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
                            selected={selectedDept}
                            setSelected={(i: IDropdownItem) => {
                                setSelectedDept(i)
                                var table = deptTableData.filter(i => i.id === selectedDept.id)
                                table[0] && setSelectedDeptTable(table[0].tableData)
                            }}
                        />
                    )}

                    <div className={styles.software}>
                        <DashboardTable data={selectedDeptTable} onRowClick={onRowClick} />
                        <div className={styles.softwareKey}>
                            <div>Cost Per Year* = Projected</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className={styles.dashColumn}>
                <Card
                    title={'Departments'}
                    titleClassName={styles.linkedTitle}
                    titleOnClick={() => {
                        history.push({pathname: `/departments`, state: {prev: history.location}})
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
                        history.push({pathname: `/programs`, state: {prev: history.location}})
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
