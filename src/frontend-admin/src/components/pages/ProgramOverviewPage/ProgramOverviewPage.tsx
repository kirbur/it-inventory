import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatCost} from '../../../utilities/FormatCost'

// Styles
import styles from './ProgramOverviewPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramOverviewPageProps {
    history: History
    match: match<{id: string}>
}

interface ExpectedProgramOverview {
    countProgInUse: number
    countProgOverall: number
    icon: string
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
    renewalDate: string
}

// Primary Component
export const ProgramOverviewPage: React.SFC<IProgramOverviewPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [img, setImg] = useState('')
    const [programData, setProgramData] = useState<ExpectedProgramOverview>({
        countProgInUse: 0,
        countProgOverall: 0,
        icon: '',
        isCostPerYear: false,
        progCostPerYear: 0,
        progFlatCost: 0,
        program: '',
        programlicenseKey: '',
    })
    const [programRows, setProgramRows] = useState<ITableItem[][]>([])
    const [pluginRows, setPluginRows] = useState<ITableItem[][]>([])

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    useEffect(() => {
        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                setProgramData(data[0].programOverview)

                let prog: ITableItem[][] = []
                data[0].inDivPrograms.map((i: ExpectedProgramType) =>
                    prog.push(
                        i.employeeName
                            ? [
                                  {value: i.programId, id: i.programId, sortBy: i.programId, onClick: handleCopyClick},
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
                                  {value: i.programId, id: i.programId, sortBy: i.programId, onClick: handleCopyClick},
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
                        {value: format(i.pluginName), sortBy: format(i.pluginName)},
                        {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                        {
                            value: formatCost(i.isCostPerYear, i.pluginCostPerYear, i.pluginFlatCost),
                            sortBy: i.pluginCostPerYear,
                        },
                    ])
                )
                setPluginRows(plug)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        axios
            .get(programData.icon)
            .then((data: any) => {
                if (data !== '') {
                    setImg(URL + programData.icon)
                } else {
                    setImg(placeholder)
                }
            })
            .catch((err: any) => console.error(err))
    }, [programData.icon])

    const handleEmpClick = (id: number) => {
        history.push(`/employees/${id}`)
    }

    const handleCopyClick = (id: number) => {
        history.push(`/programs/details/${id}`)
    }

    const handleArchive = () => {
        if (
            window.confirm(
                `Are you sure you want to archive all copies of ${match.params.id}? ${programData.countProgInUse} are in use.`
            )
        ) {
            //TODO: a post request to archive program w/ id match.params.id
            history.push('/programs')
        }
    }

    return (
        <div className={styles.progOverviewMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Programs'
                        icon='back'
                        onClick={() => {
                            history.push('/programs')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={img} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        {programData.progFlatCost !== 0 ? (
                            <p>Paid ------------------ ${programData.progFlatCost}</p>
                        ) : programData.isCostPerYear ? (
                            <p>Yearly ---------------- ${programData.progCostPerYear}</p>
                        ) : (
                            <p>Monthly --------------- ${programData.progCostPerYear}</p>
                        )}
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
                                    history.push('/editProgramOverview/' + match.params.id)
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
                    <div className={styles.titleText}>
                        <div className={styles.programName}>{match.params.id}</div>
                        <div className={styles.programText}>
                            {programData.countProgInUse} / {programData.countProgOverall} Used
                        </div>
                        {programData.programlicenseKey && (
                            <div className={styles.programText}>License Key: {programData.programlicenseKey}</div>
                        )}
                    </div>
                    <DetailPageTable headers={programHeaders} rows={programRows} setRows={setProgramRows} />
                    <div className={styles.spaceBetweenTables} />
                    <DetailPageTable headers={pluginHeaders} rows={pluginRows} setRows={setPluginRows} />
                </div>
            </div>
        </div>
    )
}
