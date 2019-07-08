import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import DatePicker from 'react-datepicker'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {ProgramForm, IProgramFormInputs} from '../../reusables/ProgramForm/ProgramForm'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {formatCost} from '../../../utilities/FormatCost'

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
    //const [programData, setProgramData] = useState<any>({})

    const [programRows, setProgramRows] = useState<any[]>([])
    const [removedProgramRows, setRemovedProgramRows] = useState<any[]>([])

    const [pluginRows, setPluginRows] = useState<any[]>([])
    const [removedPluginRows, setRemovedPluginRows] = useState<any[]>([])

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
        purchaseDate: Date
        monthsPerRenewal: number
    }>({
        name: '',
        programName: nameInput,
        description: '',
        costPerMonth: 0,
        flatCost: 0,
        renewalDate: new Date(),
        purchaseDate: new Date(),
        monthsPerRenewal: 0,
    })

    const [programInput, setProgramInput] = useState<IProgramFormInputs>({
        name: '',
        programName: nameInput,
        description: '',
        renewalDate: new Date(),
        purchaseDate: new Date(),
        purchaseLink: '',
        licenseKey: '',
        costPerMonth: 0,
        costPerYear: 0,
        flatCost: 0,
        costType: 'per month',
        monthsPerRenewal: 0,
    })

    useEffect(() => {
        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                //setProgramData(data[0].programOverview)
                setNumCopies(data[0].programOverview.countProgOverall)

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

    const handleProgramRemove = (row: any) => {
        //add to removed array
        setRemovedProgramRows([...removedProgramRows, [...row]])
    }

    const handlePluginRemove = (row: any) => {
        //add to removed array
        setRemovedPluginRows([...removedPluginRows, [...row]])
    }

    const handleSubmit = () => {
        if (programForm) {
            //TODO: post request for x# of copies w/ programInput
        }

        if (pluginForm) {
            setPluginInput({...pluginInput, programName: nameInput})
            //TODO: post request for new plugin
        }

        //TODO: post request to delete removedPluginRows & removedProgramRows
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

    const displayPlugins = () => {
        var arr: any[] = []

        if (removedPluginRows.length === 0) {
            arr = [...pluginRows]
        } else {
            var bools: any[] = []
            pluginRows.forEach((row: any, index: number) => {
                bools[index] = true
                removedPluginRows.forEach((remove: any) => {
                    bools[index] = bools[index] && remove[0].id !== row[0].id
                })
            })
            pluginRows.forEach((row: any, index: number) => {
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
                    {match.params.id === 'new' ? (
                        <Button
                            text='All Programs'
                            icon='back'
                            onClick={() => {
                                history.push(`/programs`)
                            }}
                            className={styles.backButton}
                            textClassName={styles.backButtonText}
                        />
                    ) : (
                        <Button
                            text={match.params.id}
                            icon='back'
                            onClick={() => {
                                history.push(`/programs/overview/${match.params.id}`)
                            }}
                            className={styles.backButton}
                            textClassName={styles.backButtonText}
                        />
                    )}
                    <PictureInput setImage={setImgInput} />
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    <div className={styles.title}>Program Information</div>

                    <Group justify={'between'} className={styles.nameInput}>
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
                                onChange={e =>
                                    setNumCopies(parseInt(e.target.value) > 0 ? parseInt(e.target.value) : 0)
                                }
                            />
                        </div>
                    </Group>

                    {match.params.id !== 'new' ? (
                        <Group direction={'column'}>
                            <div className={styles.programTableContainer}>
                                <DetailPageTable
                                    headers={programHeaders}
                                    rows={displayCopies()}
                                    setRows={setProgramRows}
                                    edit={true}
                                    remove={handleProgramRemove}
                                />
                            </div>

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => {
                                    setProgramForm(!programForm)
                                    setPluginForm(false)
                                }}
                                textInside={false}
                                text={`Add ${numCopies} Copy(s)`}
                            />

                            {programForm && (
                                <div className={styles.programForm}>
                                    <ProgramForm state={programInput} setState={setProgramInput} />
                                </div>
                            )}
                        </Group>
                    ) : (
                        <div className={styles.programForm}>
                            <ProgramForm state={programInput} setState={setProgramInput} />
                        </div>
                    )}

                    {match.params.id !== 'new' && (
                        <div className={styles.pluginTableContainer}>
                            <DetailPageTable
                                headers={pluginHeaders}
                                rows={displayPlugins()}
                                setRows={setPluginRows}
                                edit={true}
                                remove={handlePluginRemove}
                            />

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => {
                                    setPluginForm(!pluginForm)
                                    setProgramForm(false)
                                }}
                                textInside={false}
                                text={'Add Plugin'}
                            />
                        </div>
                    )}
                    {pluginForm && match.params.id !== 'new' && (
                        <div className={styles.pluginForm}>
                            <Group justify={'between'} className={styles.pluginGroup}>
                                <div className={styles.pluginInputContainerRow1}>
                                    <div className={styles.inputText}>Plugin Name</div>
                                    <input
                                        type='text'
                                        className={s(styles.input, styles.pluginInputRow1)}
                                        value={pluginInput.name}
                                        onChange={e => setPluginInput({...pluginInput, name: e.target.value})}
                                    />
                                </div>

                                <div className={styles.dateInputContainer}>
                                    <div className={styles.inputText}>Purchase Date</div>
                                    <DatePicker
                                        dateFormat='MM/dd/yyyy'
                                        placeholderText={new Date().toDateString()}
                                        selected={pluginInput.purchaseDate}
                                        onChange={e => e && setPluginInput({...pluginInput, purchaseDate: e})}
                                        className={s(styles.input, styles.dateInput)}
                                    />
                                </div>

                                <div className={styles.dateInputContainer}>
                                    <div className={styles.inputText}>Renewal Date</div>
                                    <DatePicker
                                        dateFormat='MM/dd/yyyy'
                                        placeholderText={new Date().toDateString()}
                                        selected={pluginInput.renewalDate}
                                        onChange={e => e && setPluginInput({...pluginInput, renewalDate: e})}
                                        className={s(styles.input, styles.dateInput)}
                                    />
                                </div>
                            </Group>

                            <Group justify={'between'} className={styles.pluginGroup}>
                                <div className={styles.pluginInputContainerRow2}>
                                    <div className={styles.inputText}>Flat Cost</div>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className={s(styles.input, styles.pluginInputRow2)}
                                        value={pluginInput.flatCost}
                                        onChange={e =>
                                            setPluginInput({...pluginInput, flatCost: parseFloat(e.target.value)})
                                        }
                                    />
                                </div>

                                <div className={styles.pluginInputContainerRow2}>
                                    <div className={styles.inputText}>Monthly Cost</div>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className={s(styles.input, styles.pluginInputRow2)}
                                        value={pluginInput.costPerMonth}
                                        onChange={e =>
                                            setPluginInput({...pluginInput, costPerMonth: parseFloat(e.target.value)})
                                        }
                                    />
                                </div>

                                <div className={styles.pluginInputContainerRow2}>
                                    <div className={styles.inputText}>Months Per Renewal</div>
                                    <input
                                        type='number'
                                        className={s(styles.input, styles.pluginInputRow2)}
                                        value={pluginInput.monthsPerRenewal}
                                        onChange={e =>
                                            setPluginInput({
                                                ...pluginInput,
                                                monthsPerRenewal: parseFloat(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </Group>
                            <div className={styles.pluginGroup}>
                                <div className={styles.inputText}>Description</div>
                                <textarea
                                    className={s(styles.input, styles.description)}
                                    value={pluginInput.description}
                                    onChange={e => setPluginInput({...pluginInput, description: e.target.value})}
                                />
                            </div>
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
