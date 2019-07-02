import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import Axios from 'axios'
// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'

import {PictureInput} from '../../reusables/PictureInput/PictureInput'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramOverviewEditPage.module.css'

// Types
interface IProgramOverviewEditPageProps {
    history: any
    match: any
}

// Primary Component
export const ProgramOverviewEditPage: React.SFC<IProgramOverviewEditPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [programData, setProgramData] = useState<any>({})
    const [programRows, setProgramRows] = useState<any[]>([])
    const [pluginRows, setPluginRows] = useState<any[]>([])

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    // input states
    const [imgInput, setImgInput] = useState<File>()

    useEffect(() => {
        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                setProgramData(data[0].programOverview)
                console.log(data)
                let prog: any[] = []
                data[0].inDivPrograms.map((i: any) =>
                    prog.push([
                        {value: i.programId, id: i.programId, sortBy: i.programId},
                        {
                            value: format(i.employeeName),
                            id: i.employeeId,
                            sortBy: format(i.employeeName),
                        },
                        {value: format(i.programLicenseKey), sortBy: i.programLicenseKey},
                        {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                    ])
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

    const handleRemove = (row: any) => {}

    return (
        <div className={styles.progOverviewEditMain}>
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
                    <PictureInput setImage={setImgInput} />
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
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
                        edit={true}
                        remove={handleRemove}
                    />

                    <Button
                        className={styles.addContainer}
                        icon='add'
                        onClick={() => {
                            //TODO:what does this look like
                        }}
                        textInside={false}
                        text={'Add Copy'}
                    />

                    <DetailPageTable
                        headers={pluginHeaders}
                        rows={pluginRows}
                        setRows={setPluginRows}
                        edit={true}
                        remove={handleRemove}
                    />

                    <Button
                        className={styles.addContainer}
                        icon='add'
                        onClick={() => {
                            //TODO: open up plugin form??
                        }}
                        textInside={false}
                        text={'Add Plugin'}
                    />
                </div>
            </div>
        </div>
    )
}
