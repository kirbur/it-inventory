import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'

// Styles
import styles from './ProgramOverviewPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramOverviewPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramOverviewPage: React.SFC<IProgramOverviewPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [programData, setProgramData] = useState<any>({})
    const [programRows, setProgramRows] = useState<any[]>([])
    const [pluginRows, setPluginRows] = useState<any[]>([])

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    useEffect(() => {
        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                setProgramData(data[0].programOverview)
                console.log(data)
                let prog: any[] = []
                data[0].inDivPrograms.map((i: any) =>
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
                                  {value: i.programLicenseKey, sortBy: i.programLicenseKey},
                                  {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                              ]
                            : [
                                  {value: i.programId, id: i.programId, sortBy: i.programId, onClick: handleCopyClick},
                                  {
                                      value: format(i.employeeName),
                                      id: i.employeeId,
                                      sortBy: format(i.employeeName),
                                  },
                                  {value: format(i.programLicenseKey), sortBy: i.programLicenseKey},
                                  {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                              ]
                    )
                )
                setProgramRows(prog)

                let plug: any[] = []
                data[0].listOfPlugins.map((i: any) =>
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

    const formatCost = (isPerYear: boolean, perYear: number, perUse: number) => {
        return isPerYear
            ? perYear + ' /yr'
            : perYear === 0
            ? perUse + ' paid'
            : Math.round((perYear / 12) * 100) / 100 + ' /mo'
    }

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
                        <img className={styles.img} src={URL + programData.icon} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        {programData.progFlatCost !== 0 ? (
                            <p>Paid ------------------ ${programData.progFlatCost}</p>
                        ) : programData.isCostPerYear ? (
                            <p>Yearly ---------------- ${programData.progCostPerYear}</p>
                        ) : (
                            <p>Monthly --------------- ${Math.round((programData.progCostPerYear / 12) * 100) / 100}</p>
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
                        {programData.programLicenseKey && (
                            <div className={styles.programText}>License Key: {programData.programLicenseKey}</div>
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
