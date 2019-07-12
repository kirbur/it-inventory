import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
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
import {ExpectedPluginType, ExpectedProgramType} from './ProgramOverviewPage'
interface IProgramOverviewEditPageProps {
    history: History
    match: match<{id: string}>
}

interface IPluginInfo {
    id: number
    name: string
    programName: string
    description: string
    recurringCost: number
    flatCost: number
    renewalDate: Date
    purchaseDate: Date
    monthsPerRenewal: number
}

// Primary Component
export const ProgramOverviewEditPage: React.SFC<IProgramOverviewEditPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken, isAdmin},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)

    const [programRows, setProgramRows] = useState<ITableItem[][]>([])
    const [removedProgramRows, setRemovedProgramRows] = useState<ITableItem[][]>([])

    const [pluginRows, setPluginRows] = useState<ITableItem[][]>([])
    const [removedPluginRows, setRemovedPluginRows] = useState<ITableItem[][]>([])

    const [pluginForm, setPluginForm] = useState(false)
    const [programForm, setProgramForm] = useState({edit: false, add: false})

    const programHeaders = [`${match.params.id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    // input states
    const [imgInput, setImgInput] = useState<File>()
    const [imgLocation, setImgLocation] = useState<string>()
    const [nameInput, setNameInput] = useState<string>(match.params.id === 'new' ? '' : match.params.id)
    const [numCopies, setNumCopies] = useState(1)

    const defaultPluginInfo = {
        id: -1,
        name: '',
        programName: nameInput,
        description: '',
        recurringCost: 0,
        flatCost: 0,
        renewalDate: new Date(),
        purchaseDate: new Date(),
        monthsPerRenewal: 0,
    }
    const [pluginInput, setPluginInput] = useState<IPluginInfo>({...defaultPluginInfo})

    const [pluginList, setPluginList] = useState<IPluginInfo[]>([])

    const [programInput, setProgramInput] = useState<IProgramFormInputs>({
        name: {value: '', changed: false},
        programName: {value: nameInput, changed: false},
        description: {value: '', changed: false},
        renewalDate: {value: new Date(), changed: false},
        purchaseDate: {value: new Date(), changed: false},
        purchaseLink: {value: '', changed: false},
        licenseKey: {value: '', changed: false},
        cost: {value: 0, changed: false},
        flatCost: {value: 0, changed: false},
        monthsPerRenewal: {value: 0, changed: false},
        isLicense: {value: false, changed: false},
    })

    const [programUpdateInput, setProgramUpdateInput] = useState<IProgramFormInputs>({
        name: {value: '', changed: false},
        programName: {value: nameInput, changed: false},
        description: {value: '', changed: false},
        renewalDate: {value: new Date(), changed: false},
        purchaseLink: {value: '', changed: false},
        licenseKey: {value: '', changed: false},
        cost: {value: 0, changed: false},
        flatCost: {value: 0, changed: false},
        monthsPerRenewal: {value: 0, changed: false},
        isLicense: {value: false, changed: false},
    })

    useEffect(() => {
        if (match.params.id !== 'new') {
            axios
                .get(`/detail/ProgramOverview/${match.params.id}`)
                .then((data: any) => {
                    setImgLocation(data[0].programOverview.icon)
                    setNumCopies(data[0].programOverview.countProgOverall)

                    let prog: ITableItem[][] = []
                    data[0].inDivPrograms.map((i: ExpectedProgramType) =>
                        prog.push([
                            {value: i.programId, id: i.programId, sortBy: i.programId},
                            {
                                value: format(i.employeeName),
                                id: i.employeeId,
                                sortBy: format(i.employeeName),
                            },
                            {value: format(i.programlicenseKey), sortBy: i.programlicenseKey},
                            {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                        ])
                    )
                    setProgramRows(prog)

                    setProgramInput({
                        ...programInput,
                        isLicense: {value: data[0].programOverview.isLicense, changed: false},
                    })

                    setProgramUpdateInput({
                        ...programUpdateInput,
                        isLicense: {value: data[0].programOverview.isLicense, changed: false},
                    })

                    let plug: ITableItem[][] = []
                    let plugList: IPluginInfo[] = []
                    data[0].listOfPlugins.map((i: ExpectedPluginType) => {
                        plug.push([
                            {
                                value: format(i.pluginName),
                                sortBy: format(i.pluginName),
                                id: i.pluginId,
                                tooltip: i.textField,
                            },
                            {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                            {
                                value: formatCost(i.isCostPerYear, i.pluginCostPerYear, i.pluginFlatCost),
                                sortBy: i.pluginCostPerYear,
                            },
                        ])

                        plugList.push({
                            id: i.pluginId,
                            name: i.pluginName,
                            programName: match.params.id,
                            description: i.textField,
                            recurringCost: i.pluginCostPerYear / (12 / i.monthsPerRenewal),
                            flatCost: i.pluginFlatCost,
                            renewalDate: i.renewalDate ? new Date(i.renewalDate) : new Date(),
                            purchaseDate: i.dateBought ? new Date(i.dateBought) : new Date(),
                            monthsPerRenewal: i.monthsPerRenewal,
                        })
                    })
                    setPluginRows(plug)
                    setPluginList(plugList)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    const handleProgramRemove = (row: ITableItem[]) => {
        //add to removed array
        setRemovedProgramRows([...removedProgramRows, [...row]])
    }

    const handlePluginRemove = (row: ITableItem[]) => {
        //add to removed array
        setRemovedPluginRows([...removedPluginRows, [...row]])
    }

    const handlePluginEdit = (row: ITableItem[]) => {
        //TODO: fill in plugin form w/ current plugin info

        setPluginForm(true)

        //TODO: use id not name
        var plug = pluginList.filter(plugin => plugin.name === row[0].value)
        setPluginInput({...plug[0]})
    }

    async function handleSubmit() {
        var postProgram = {
            Program: {
                numberOfPrograms: Number.isNaN(numCopies) ? 0 : numCopies,
                ProgramName: nameInput,
                ProgramCostPerYear: Number.isNaN(programInput.cost.value)
                    ? 0
                    : programInput.cost.value * (12 / programInput.monthsPerRenewal.value),
                ProgramFlatCost: Number.isNaN(programInput.flatCost.value) ? 0 : programInput.flatCost.value,
                ProgramLicenseKey: programInput.licenseKey.value,
                IsLicense: programInput.isLicense.value,
                ProgramDescription: programInput.description.value,
                ProgramPurchaseLink: programInput.purchaseLink.value,
                DateBought: programInput.purchaseDate
                    ? programInput.purchaseDate.value.toISOString()
                    : new Date().toISOString(),
                RenewalDate:
                    programInput.monthsPerRenewal.value === 0 ? null : programInput.renewalDate.value.toISOString(),
                MonthsPerRenewal: programInput.cost.value
                    ? Number.isNaN(programInput.monthsPerRenewal.value) || programInput.monthsPerRenewal.value === 0
                        ? 1 //default is monthly
                        : programInput.monthsPerRenewal.value
                    : null,
            },
        }

        if (match.params.id === 'new') {
            var msg: string = ''
            if (
                postProgram.Program.numberOfPrograms >= 1 &&
                postProgram.Program.ProgramName &&
                (postProgram.Program.ProgramCostPerYear > 0 || postProgram.Program.ProgramFlatCost > 0) &&
                postProgram.Program.DateBought
            ) {
                await axios
                    .post('/add/program', postProgram)
                    .then((response: any) => {
                        if (response.status === 201) {
                            msg = numCopies + ' copies of ' + nameInput + ' were added to inventory!'
                            window.alert(msg)
                        }
                        return
                    })
                    .catch((err: any) => console.error(err))

                //after submitting go back to detail
                history.push(`/programs`)
            } else {
                msg = 'Failed because: \n'
                msg += postProgram.Program.numberOfPrograms < 1 ? 'Not enough copies,\n' : ''
                msg += postProgram.Program.ProgramName === '' ? 'No name entered,\n' : ''
                msg +=
                    postProgram.Program.ProgramCostPerYear <= 0 && postProgram.Program.ProgramFlatCost <= 0
                        ? 'No cost entered,\n'
                        : ''
                window.alert(msg)
            }
        } else {
            //Add x# of new copies w/ programInput
            if (programForm.add) {
                postProgram.Program.ProgramName = match.params.id
                if (
                    postProgram.Program.numberOfPrograms >= 1 &&
                    (postProgram.Program.ProgramCostPerYear > 0 || postProgram.Program.ProgramFlatCost > 0) &&
                    postProgram.Program.DateBought
                ) {
                    await axios
                        .post('/add/program', postProgram)
                        .then((response: any) => {
                            console.log(response)
                            if (response.status === 201) {
                                msg = numCopies + ' copies of ' + nameInput + ' were added to inventory!'
                                window.alert(msg)
                            }
                            return
                        })
                        .catch((err: any) => console.error(err))

                    //after submitting go back to detail
                    history.push(`/programs/overview/${match.params.id}`)
                } else {
                    msg = 'Failed because: \n'
                    msg += postProgram.Program.numberOfPrograms < 1 ? 'Not enough copies,\n' : ''
                    msg += postProgram.Program.ProgramName === '' ? 'No name entered,\n' : ''
                    msg +=
                        postProgram.Program.ProgramCostPerYear <= 0 && postProgram.Program.ProgramFlatCost <= 0
                            ? 'No cost entered,\n'
                            : ''
                    window.alert(msg)
                }
            }

            //Edit all existing copies w/ programInput
            if (programForm.edit || programUpdateInput.isLicense.changed) {
                var updateProgram = {
                    Program: {
                        OldProgramName: match.params.id,
                        NewProgramName: programUpdateInput.name.changed ? programUpdateInput.name.value : null,
                        ProgramCostPerYear: programUpdateInput.cost.changed
                            ? programUpdateInput.cost.value * (12 / programUpdateInput.monthsPerRenewal.value)
                            : null,
                        ProgramFlatCost: programUpdateInput.flatCost.changed ? programUpdateInput.flatCost.value : null,
                        ProgramLicenseKey: programUpdateInput.licenseKey.changed
                            ? programUpdateInput.licenseKey.value
                            : null,
                        IsLicense: programUpdateInput.isLicense.value,
                        ProgramDescription: programUpdateInput.description.changed
                            ? programUpdateInput.description.value
                            : null,
                        ProgramPurchaseLink: programUpdateInput.purchaseLink.changed
                            ? programUpdateInput.purchaseLink.value
                            : null,
                        // DateBought: programUpdateInput.purchaseDate.changed
                        //     ? programUpdateInput.purchaseDate.value.toISOString()
                        //     : null,
                        RenewalDate: programUpdateInput.renewalDate.changed
                            ? programUpdateInput.renewalDate.value.toISOString()
                            : null,
                        MonthsPerRenewal: programUpdateInput.monthsPerRenewal.changed
                            ? programUpdateInput.monthsPerRenewal.value
                            : null,
                    },
                }

                await axios.put(`update/programall`, updateProgram).catch((err: any) => console.error(err))

                //after submitting go back to detail
                history.push(`/programs/overview/${match.params.id}`)
            }

            if (pluginForm) {
                setPluginInput({...pluginInput, programName: nameInput})
                var postPlugin = {
                    PluginId: pluginInput.id,
                    ProgramName: match.params.id,
                    PluginName: pluginInput.name,
                    PluginFlatCost: pluginInput.flatCost,
                    TextFeild: pluginInput.description,
                    PluginCostPerYear: pluginInput.recurringCost * (12 / pluginInput.monthsPerRenewal),
                    RenewalDate: pluginInput.renewalDate.toISOString(),
                    MonthsPerRenewal: pluginInput.monthsPerRenewal,
                    DateBought: pluginInput.purchaseDate.toISOString(),
                }

                if (pluginInput.id === -1) {
                    //TODO: post request for new plugin
                    // axios.post('/add/plugin', postPlugin)
                    // .catch((err: any) => console.error(err))
                } else {
                    //TODO: put request edit plugin
                    // axios.put('/update/plugin', postPlugin)
                    // .catch((err: any) => console.error(err))
                }
            }

            //TODO: post request to delete removedPluginRows & removedProgramRows
        }

        if (imgInput && imgLocation) {
            var formData = new FormData()
            formData.append('file', imgInput)

            await axios
                .put(imgLocation, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .then(data => console.log(data))
                .catch(err => console.error(err))

            //after submitting go back to detail
            history.push(`/programs/overview/${match.params.id}`)
        }
    }

    const displayCopies = () => {
        var arr: ITableItem[][] = []

        if (removedProgramRows.length === 0) {
            arr = [...programRows]
        } else {
            var bools: boolean[] = []
            programRows.forEach((row: ITableItem[], index: number) => {
                bools[index] = true
                removedProgramRows.forEach((remove: ITableItem[]) => {
                    bools[index] = bools[index] && remove[0].id !== row[0].id
                })
            })
            programRows.forEach((row: ITableItem[], index: number) => {
                if (bools[index]) {
                    arr.push(row)
                }
            })
        }

        return arr
    }

    const displayPlugins = () => {
        var arr: ITableItem[][] = []

        if (removedPluginRows.length === 0) {
            arr = [...pluginRows]
        } else {
            var bools: boolean[] = []
            pluginRows.forEach((row: ITableItem[], index: number) => {
                bools[index] = true
                removedPluginRows.forEach((remove: ITableItem[]) => {
                    //TODO: use id instead of value
                    bools[index] = bools[index] && remove[0].value !== row[0].value
                })
            })
            pluginRows.forEach((row: ITableItem[], index: number) => {
                if (bools[index]) {
                    arr.push(row)
                }
            })
        }

        return arr
    }

    return isAdmin ? (
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
                    <PictureInput setImage={setImgInput} image={imgInput} />
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

                        <div className={styles.checkBoxContainer}>
                            <div className={styles.inputText}>License</div>
                            <div
                                className={styles.checkbox}
                                onClick={() =>
                                    setProgramUpdateInput({
                                        ...programUpdateInput,
                                        isLicense: {value: !programUpdateInput.isLicense.value, changed: true},
                                    })
                                }
                            >
                                <div className={styles.check} />
                                {programUpdateInput.isLicense.value && <div className={styles.insideCheck} />}
                            </div>
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
                            <div className={styles.programTableContainer}>
                                <DetailPageTable
                                    headers={programHeaders}
                                    rows={displayCopies()}
                                    setRows={setProgramRows}
                                    edit={true}
                                    remove={handleProgramRemove}
                                    hover={false}
                                />
                            </div>

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => {
                                    setProgramForm({...programForm, edit: !programForm.edit})
                                }}
                                textInside={false}
                                text={`Edit All Copies`}
                            />

                            {programForm.edit && (
                                <div className={styles.programForm}>
                                    <ProgramForm state={programUpdateInput} setState={setProgramUpdateInput} />
                                </div>
                            )}

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => {
                                    setProgramForm({...programForm, add: !programForm.add})
                                }}
                                textInside={false}
                                text={`Add ${numCopies} Copy(s)`}
                            />
                            {programForm.add && (
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
                                editRows={handlePluginEdit}
                                hover={false}
                            />

                            <Button
                                className={styles.addContainer}
                                icon='add'
                                onClick={() => {
                                    setPluginForm(!pluginForm)
                                    setPluginInput({...defaultPluginInfo})
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
                                    <div className={styles.inputText}>Recurring Cost</div>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className={s(styles.input, styles.pluginInputRow2)}
                                        value={pluginInput.recurringCost}
                                        onChange={e =>
                                            setPluginInput({
                                                ...pluginInput,
                                                recurringCost: parseFloat(e.target.value),
                                            })
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
    ) : (
        <div />
    )
}
