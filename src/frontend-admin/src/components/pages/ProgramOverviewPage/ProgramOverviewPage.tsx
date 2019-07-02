import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import Axios from 'axios'
// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramOverviewPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

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

                let prog: any[] = []
                data[0].inDivPrograms.map((i: any) =>
                    prog.push([
                        format(i.programId),
                        format(i.programId),
                        format(i.employeeName),
                        format(i.programLicenseKey),
                        formatDate(i.renewalDate),
                    ])
                )
                setProgramRows(prog)

                let plug: any[] = []
                data[0].listOfPlugins.map((i: any) =>
                    plug.push([
                        format(0),
                        format(i.pluginName),
                        formatDate(i.renewalDate),
                        formatCost(i.isCostPerYear, i.pluginCostPerYear, i.pluginFlatCost),
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
                    <DetailPageTable
                        headers={programHeaders}
                        rows={programRows}
                        setRows={setProgramRows}
                        onRowClick={id => history.push(`/programs/details/${id}`)}
                    />
                    {isAdmin && (
                        <Button
                            className={styles.addContainer}
                            icon='add'
                            onClick={() => {
                                //TODO:what does this look like
                            }}
                            textInside={false}
                            text={'Add Copy'}
                        />
                    )}

                    <DetailPageTable headers={pluginHeaders} rows={pluginRows} setRows={setPluginRows} />
                    {isAdmin && (
                        <Button
                            className={styles.addContainer}
                            icon='add'
                            onClick={() => {
                                //TODO: open up plugin form??
                            }}
                            textInside={false}
                            text={'Add Plugin'}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
