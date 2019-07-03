import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import DatePicker from 'react-datepicker'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {ProgramForm} from '../../reusables/ProgramForm/ProgramForm'

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
    const [removedProgramRows, setRemovedProgramRows] = useState<any[]>([])

    const [pluginForm, setPluginForm] = useState(false)
    const [programForm, setProgramForm] = useState(false)

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    // input states
    const [imgInput, setImgInput] = useState<File>()
    const [nameInput, setNameInput] = useState<string>(match.params.id === 'new' ? '' : match.params.id)
    const [numCopies, setNumCopies] = useState(1)
    const [pluginInput, setPluginInput] = useState<{
        name: string
        programName: string
        description: string
        costPerMonth: number
        flatCost: number
        renewalDate: Date
        monthsPerRenewal: number
    }>({
        name: '',
        programName: nameInput,
        description: '',
        costPerMonth: 0,
        flatCost: 0,
        renewalDate: new Date(),
        monthsPerRenewal: 0,
    })

    const [programInput, setProgramInput] = useState<{
        name: string
        programName: string
        description: string
        costPerMonth: number
        flatCost: number
        renewalDate: Date
        monthsPerRenewal: number
    }>({
        name: '',
        programName: nameInput,
        description: '',
        costPerMonth: 0,
        flatCost: 0,
        renewalDate: new Date(),
        monthsPerRenewal: 0,
    })

    useEffect(() => {
        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                setProgramData(data[0].programOverview)
                setNumCopies(data[0].programOverview.countProgOverall)
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

    const handleRemove = (row: any) => {
        //add to removed array
        setRemovedProgramRows([...removedProgramRows, [...row]])
    }

    const handleSubmit = () => {
        setPluginInput({...pluginInput, programName: nameInput})
        //TODO: post request
    }

    const handleProgramSubmit = () => {
        //TODO: post request
    }

    const displayCopies = () => {
        var arr: any[] = []

        if (removedProgramRows.length === 0) {
            arr = [...programRows]
        } else {
            var bools: any[] = []
            programRows.forEach((row: any, index: number) => {
                bools[index] = true
                removedProgramRows.forEach((remove: any) => {
                    bools[index] = bools[index] && remove[0].id !== row[0].id
                })
            })
            programRows.forEach((row: any, index: number) => {
                if (bools[index]) {
                    arr.push(row)
                }
            })
        }

        return arr
    }
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
                    <Group className={styles.nameInput}>
                        <div className={styles.inputContainer}>
                            <div className={styles.inputText}>Program Name</div>
                            <input
                                type='text'
                                className={styles.input}
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputContainer}>
                            <div className={styles.inputText}># of Copies</div>
                            <input
                                type='number'
                                className={s(styles.input, styles.pluginInput)}
                                value={numCopies}
                                onChange={e => setNumCopies(parseInt(e.target.value))}
                            />
                        </div>
                    </Group>

                    {match.params.id !== 'new' ? (
                        <Group direction={'column'}>
                            <DetailPageTable
                                headers={programHeaders}
                                rows={displayCopies()}
                                setRows={setProgramRows}
                                edit={true}
                                remove={handleRemove}
                            />

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => setProgramForm(!programForm)}
                                textInside={false}
                                text={'Add Copy'}
                            />

                            {programForm && (
                                <ProgramForm
                                    state={programInput}
                                    setState={setProgramInput}
                                    submit={handleProgramSubmit}
                                />
                            )}
                        </Group>
                    ) : (
                        <div className={styles.programForm}>
                            <ProgramForm state={programInput} setState={setProgramInput} submit={handleProgramSubmit} />
                        </div>
                    )}

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
                            setPluginForm(!pluginForm)
                        }}
                        textInside={false}
                        text={'Add Plugin'}
                    />

                    {pluginForm && (
                        <div className={styles.pluginForm}>
                            <Group className={styles.pluginGroup}>
                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Plugin Name</div>
                                    <input
                                        type='text'
                                        className={s(styles.input, styles.pluginInput)}
                                        value={pluginInput.name}
                                        onChange={e => setPluginInput({...pluginInput, name: e.target.value})}
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Description</div>
                                    <input
                                        type='text'
                                        className={s(styles.input, styles.pluginInput)}
                                        value={pluginInput.description}
                                        onChange={e => setPluginInput({...pluginInput, description: e.target.value})}
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Renewal Date</div>
                                    <DatePicker
                                        dateFormat='MM/dd/yyyy'
                                        placeholderText={new Date().toDateString()}
                                        selected={pluginInput.renewalDate}
                                        onChange={e => e && setPluginInput({...pluginInput, renewalDate: e})}
                                        className={s(styles.input, styles.pluginInput)}
                                    />
                                </div>
                            </Group>

                            <Group className={styles.pluginGroup}>
                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Flat Cost</div>
                                    <input
                                        type='number'
                                        className={s(styles.input, styles.pluginInput)}
                                        value={pluginInput.flatCost}
                                        onChange={e =>
                                            setPluginInput({...pluginInput, flatCost: parseInt(e.target.value)})
                                        }
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Monthly Cost</div>
                                    <input
                                        type='number'
                                        className={s(styles.input, styles.pluginInput)}
                                        value={pluginInput.costPerMonth}
                                        onChange={e =>
                                            setPluginInput({...pluginInput, costPerMonth: parseInt(e.target.value)})
                                        }
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <div className={styles.inputText}>Months Per Renewal</div>
                                    <input
                                        type='number'
                                        className={s(styles.input, styles.pluginInput)}
                                        value={pluginInput.monthsPerRenewal}
                                        onChange={e =>
                                            setPluginInput({...pluginInput, monthsPerRenewal: parseInt(e.target.value)})
                                        }
                                    />
                                </div>
                            </Group>
                        </div>
                    )}
                    <div className={styles.submitContainer}>
                        <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                    </div>
                </div>
            </div>
        </div>
    )
}
