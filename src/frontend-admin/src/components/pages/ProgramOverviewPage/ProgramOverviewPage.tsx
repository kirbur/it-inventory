import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'
import {BackButton} from '../../reusables/BackButton/BackButton'
import {DetailImage} from '../../reusables/DetailImage/DetailImage'
import {DetailCostText} from '../../reusables/DetailCostText/DetailCostText'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatCost} from '../../../utilities/FormatCost'
import {checkImage} from '../../../utilities/CheckImage'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramOverviewPage.module.css'

// Context
import {LoginContext, ThemeContext} from '../../App/App'

// Types
interface IProgramOverviewPageProps {
    history: History
    match: match<{id: string; archived: string}>
}

interface ExpectedProgramOverview {
    countProgInUse: number
    countProgOverall: number
    isCostPerYear: boolean
    progCostPerYear: number
    progFlatCost: number
    program: string
    programlicenseKey: string
}

export interface ExpectedProgramType {
    employeeId: number
    employeeName: string
    programId: number
    programlicenseKey: string
    renewalDate: string
}

export interface ExpectedPluginType {
    isCostPerYear: boolean
    pluginCostPerYear: number
    pluginFlatCost: number
    pluginName: string
    pluginId: number
    renewalDate: string
    dateBought: string
    textField: string
    monthsPerRenewal: number
}

// Primary Component
export const ProgramOverviewPage: React.SFC<IProgramOverviewPageProps> = props => {
    const {
        history,
        match: {
            params: {archived, id},
        },
    } = props

    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const {isDarkMode} = useContext(ThemeContext)

    const axios = new AxiosService(loginContextVariables)
    const [img, setImg] = useState('')
    const [programData, setProgramData] = useState<ExpectedProgramOverview>({
        countProgInUse: 0,
        countProgOverall: 0,
        isCostPerYear: false,
        progCostPerYear: 0,
        progFlatCost: 0,
        program: '',
        programlicenseKey: '',
    })
    const [programRows, setProgramRows] = useState<ITableItem[][]>([])
    const [pluginRows, setPluginRows] = useState<ITableItem[][]>([])

    const programHeaders = [`${id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    async function getData() {
        await axios
            .get(`/detail/ProgramOverview/${id}/${archived === 'archived' ? true : false}`)
            .then((data: any) => {
                setProgramData(data[0].programOverview)
                let prog: ITableItem[][] = []
                data[0].inDivPrograms.map((i: ExpectedProgramType) =>
                    prog.push(
                        i.employeeName
                            ? [
                                  {
                                      value: `Copy ${i.programId}`,
                                      id: i.programId,
                                      sortBy: i.programId,
                                      onClick: handleCopyClick,
                                  },
                                  {
                                      value: format(i.employeeName),
                                      id: i.employeeId,
                                      sortBy: format(i.employeeName),
                                      onClick: handleEmpClick,
                                  },
                                  {value: format(i.programlicenseKey), sortBy: i.programlicenseKey},
                                  {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                              ]
                            : [
                                  {
                                      value: `Copy ${i.programId}`,
                                      id: i.programId,
                                      sortBy: i.programId,
                                      onClick: handleCopyClick,
                                  },
                                  {
                                      value: format(i.employeeName),
                                      id: i.employeeId,
                                      sortBy: format(i.employeeName),
                                  },
                                  {value: format(i.programlicenseKey), sortBy: i.programlicenseKey},
                                  {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                              ]
                    )
                )
                setProgramRows(prog)

                let plug: ITableItem[][] = []
                data[0].listOfPlugins.map((i: ExpectedPluginType) =>
                    plug.push([
                        {value: format(i.pluginName), sortBy: format(i.pluginName), tooltip: i.textField},
                        {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                        {
                            value: formatCost(i.isCostPerYear, i.pluginCostPerYear, i.pluginFlatCost),
                            sortBy: i.pluginCostPerYear,
                        },
                    ])
                )
                setPluginRows(plug)

                checkImage(data[0].programOverview.icon, axios, placeholder)
                    .then(image => setImg(image))
                    .catch(err => console.error(err))
            })
            .catch((err: any) => console.error(err))
    }
    useEffect(() => {
        getData()
    }, [])

    const handleEmpClick = (id: number) => {
        history.push({pathname: `/employees/detail/${id}`, state: {prev: history.location}})
    }

    const handleCopyClick = (id: number) => {
        history.push({pathname: `/programs/detail/${id}`, state: {prev: history.location}})
    }

    const handleArchive = () => {
        //cant archive everything unless there are no plugins
        if (pluginRows.length > 0 && archived !== 'archived') {
            window.alert('Please archive the plugins before you archive this program.')
        } else if (archived !== 'archived') {
            if (
                window.confirm(
                    `Are you sure you want to archive all copies of ${id}? ${programData.countProgInUse} are in use.`
                )
            ) {
                programRows.forEach(program => {
                    axios.put(`archive/program/${program[0].id}`, {}).catch((err: any) => console.error(err))
                })
                setProgramRows([])
                history.push({pathname: '/programs', state: {prev: history.location}})
            }
        }

        if (archived === 'archived') {
            if (window.confirm(`Are you sure you want to recover ${id}? `)) {
                programRows.forEach(program => {
                    axios.put(`recover/program/${program[0].id}`, {}).catch((err: any) => console.error(err))
                })
                setProgramRows([])
                history.push({pathname: `/programs/edit/overview/${id}/inventory`, state: {prev: history.location}})
            }
        }
    }

    return (
        <div className={s(styles.progOverviewMain, isDarkMode ? styles.backgroundDark : {})}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    <DetailImage src={img} />
                    {programData.progFlatCost > 0 && (
                        <DetailCostText costTexts={[{title: 'Paid', cost: `$${programData.progFlatCost}`}]} />
                    )}
                    {programData.isCostPerYear ? (
                        <DetailCostText costTexts={[{title: 'Yearly', cost: `$${programData.progCostPerYear}`}]} />
                    ) : (
                        programData.progCostPerYear > 0 && (
                            <DetailCostText costTexts={[{title: 'Monthly', cost: `$${programData.progCostPerYear}`}]} />
                        )
                    )}
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            {archived !== 'archived' && (
                                <Button
                                    text='Edit'
                                    icon='edit'
                                    onClick={() => {
                                        history.push({
                                            pathname: `/programs/edit/overview/${id}/${archived}`,
                                            state: {prev: history.location},
                                        })
                                    }}
                                    className={styles.editbutton}
                                />
                            )}

                            <Button
                                text={archived === 'archived' ? 'Recover' : 'Archive'}
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={s(styles.programName, isDarkMode ? styles.dark : {})}>{id}</div>
                        <div className={styles.programText}>
                            {programData.countProgInUse} / {programData.countProgOverall} Used
                        </div>
                        {programData.programlicenseKey && (
                            <div className={styles.programText}>License Key: {programData.programlicenseKey}</div>
                        )}
                    </div>
                    <DetailPageTable
                        headers={programHeaders}
                        rows={programRows}
                        setRows={setProgramRows}
                        className={styles.table}
                    />
                    <div className={styles.spaceBetweenTables} />
                    <DetailPageTable
                        headers={pluginHeaders}
                        rows={pluginRows}
                        setRows={setPluginRows}
                        className={styles.table}
                    />
                </div>
            </div>
        </div>
    )
}
