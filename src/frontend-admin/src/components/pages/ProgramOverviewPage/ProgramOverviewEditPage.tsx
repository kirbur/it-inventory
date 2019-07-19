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
import {Checkbox} from '../../reusables/Checkbox/Checkbox'

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
    match: match<{id: string; archived: string}>
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
    const {
        history,
        match: {
            params: {id, archived},
        },
    } = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)

    const [programRows, setProgramRows] = useState<ITableItem[][]>([])
    const [removedProgramRows, setRemovedProgramRows] = useState<ITableItem[][]>([])

    const [pluginRows, setPluginRows] = useState<ITableItem[][]>([])
    const [removedPluginRows, setRemovedPluginRows] = useState<ITableItem[][]>([])

    const [pluginForm, setPluginForm] = useState(false)
    const [programForm, setProgramForm] = useState({edit: false, add: false})

    const programHeaders = [`${id}`, 'Employee', 'License Key', 'Renewal Date']
    const pluginHeaders = ['Plugins', 'Renewal Date', 'Cost']

    // input states
    const [imgInput, setImgInput] = useState<File>()
    const [imgLocation, setImgLocation] = useState<string>()

    const [overviewInputs, setOverviewInputs] = useState({
        name: {value: id === 'new' ? '' : id, changed: false},
        isLicense: {value: false, changed: false},
    })
    const [numCopies, setNumCopies] = useState(1)

    const defaultPluginInfo = {
        id: -1,
        name: '',
        programName: overviewInputs.name.value,
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
        programName: {value: overviewInputs.name.value, changed: false},
        description: {value: '', changed: false},
        renewalDate: {value: new Date(), changed: false},
        purchaseDate: {value: new Date(), changed: false},
        purchaseLink: {value: '', changed: false},
        licenseKey: {value: '', changed: false},
        cost: {value: 0, changed: false},
        flatCost: {value: 0, changed: false},
        monthsPerRenewal: {value: 0, changed: false},
    })

    const [programUpdateInput, setProgramUpdateInput] = useState<IProgramFormInputs>({
        name: {value: '', changed: false},
        programName: {value: overviewInputs.name.value, changed: false},
        description: {value: '', changed: false},
        renewalDate: {value: new Date(), changed: false},
        purchaseLink: {value: '', changed: false},
        licenseKey: {value: '', changed: false},
        cost: {value: 0, changed: false},
        flatCost: {value: 0, changed: false},
        monthsPerRenewal: {value: 0, changed: false},
    })

    useEffect(() => {
        if (id !== 'new') {
            axios
                .get(`/detail/ProgramOverview/${id}/${archived === 'archived' ? true : false}`)
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

                    setOverviewInputs({
                        ...overviewInputs,
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
                            programName: id,
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
        //open the plugin form
        setPluginForm(true)

        var plug = pluginList.filter(plugin => plugin.id === row[0].id)
        setPluginInput({...plug[0]})
    }

    async function handleSubmit() {
        var postProgram = {
            Program: {
                numberOfPrograms: Number.isNaN(numCopies) ? 0 : numCopies,
                ProgramName: overviewInputs.name.value,
                ProgramCostPerYear:
                    Number.isNaN(programInput.cost.value) || programInput.cost.value <= 0
                        ? 0
                        : programInput.cost.value * (12 / programInput.monthsPerRenewal.value),
                ProgramFlatCost: Number.isNaN(programInput.flatCost.value) ? 0 : programInput.flatCost.value,
                ProgramLicenseKey: programInput.licenseKey.value,
                IsLicense: overviewInputs.isLicense.value,
                Description: programInput.description.value,
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

        if (id === 'new') {
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
                            msg = numCopies + ' copies of ' + overviewInputs.name.value + ' were added to inventory!'
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
                postProgram.Program.ProgramName = id
                if (
                    postProgram.Program.numberOfPrograms >= 1 &&
                    (postProgram.Program.ProgramCostPerYear > 0 || postProgram.Program.ProgramFlatCost > 0) &&
                    postProgram.Program.DateBought
                ) {
                    await axios
                        .post('/add/program', postProgram)
                        .then((response: any) => {
                            if (response.status === 201) {
                                msg =
                                    numCopies + ' copies of ' + overviewInputs.name.value + ' were added to inventory!'
                                window.alert(msg)
                            }
                            return
                        })
                        .catch((err: any) => console.error(err))

                    //after submitting go back to detail
                    history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
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
            if (programForm.edit || overviewInputs.isLicense.changed || overviewInputs.name.changed) {
                var updateProgram = {
                    Program: {
                        OldProgramName: id,
                        ProgramName: overviewInputs.name.changed ? overviewInputs.name.value : null,
                        ProgramCostPerYear: programUpdateInput.cost.changed
                            ? programUpdateInput.cost.value * (12 / programUpdateInput.monthsPerRenewal.value)
                            : null,
                        ProgramFlatCost: programUpdateInput.flatCost.changed ? programUpdateInput.flatCost.value : null,
                        ProgramLicenseKey: programUpdateInput.licenseKey.changed
                            ? programUpdateInput.licenseKey.value
                            : null,
                        IsLicense: overviewInputs.isLicense.changed ? overviewInputs.isLicense.value : null,
                        Description: programUpdateInput.description.changed
                            ? programUpdateInput.description.value
                            : null,
                        ProgramPurchaseLink: programUpdateInput.purchaseLink.changed
                            ? programUpdateInput.purchaseLink.value
                            : null,
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
                history.push(
                    `/programs/overview/${overviewInputs.name.changed ? overviewInputs.name.value : id}/${
                        archived ? 'archived' : 'inventory'
                    }`
                )
            }

            if (pluginForm) {
                setPluginInput({...pluginInput, programName: overviewInputs.name.value})
                var postPlugin = {
                    PluginId: pluginInput.id,
                    ProgramName: id,
                    PluginName: pluginInput.name,
                    PluginFlatCost: pluginInput.flatCost,
                    TextField: pluginInput.description,
                    PluginCostPerYear: pluginInput.monthsPerRenewal
                        ? pluginInput.recurringCost * (12 / pluginInput.monthsPerRenewal)
                        : 0,
                    RenewalDate: pluginInput.renewalDate.toISOString(),
                    MonthsPerRenewal: pluginInput.monthsPerRenewal ? pluginInput.monthsPerRenewal : 0,
                    DateBought: pluginInput.purchaseDate.toISOString(),
                }

                if (
                    (postPlugin.PluginCostPerYear || postPlugin.PluginFlatCost) &&
                    format(postPlugin.PluginName) !== '-'
                ) {
                    if (pluginInput.id === -1) {
                        await axios.post('/add/plugin', postPlugin).catch((err: any) => console.error(err))

                        //after submitting go back to detail
                        history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
                    } else {
                        await axios.put('/update/plugin', postPlugin).catch((err: any) => console.error(err))

                        //after submitting go back to detail
                        history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
                    }
                } else {
                    msg = 'Failed to Add Plugin Because: \n'
                    msg += format(postPlugin.PluginName) === '-' ? 'No name entered,\n' : ''
                    msg += !postPlugin.PluginCostPerYear && !postPlugin.PluginFlatCost ? 'No cost entered,\n' : ''
                    window.alert(msg)
                }
            }

            if (removedPluginRows.length > 0) {
                removedPluginRows.forEach(remove =>
                    axios
                        .put(`archive/plugin/${remove[0].id}`, {})
                        .then((response: any) => console.log(response))
                        .catch((err: any) => console.error(err))
                )
                setRemovedPluginRows([])
                //after submitting go back to detail
                history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
            }

            if (removedProgramRows.length > 0) {
                if (removedProgramRows.length === programRows.length && pluginRows.length > 0) {
                    window.alert('Please archive the plugins before you archive all copies of this program.')
                    window.location.reload()
                } else {
                    removedProgramRows.forEach(remove => {
                        axios.put(`archive/program/${remove[0].id}`, {}).catch((err: any) => console.error(err))
                    })
                    setRemovedProgramRows([])
                    //after submitting go back to detail
                    history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
                }
            }
        }

        if (imgInput && imgLocation) {
            var formData = new FormData()
            formData.append('file', imgInput)

            await axios
                .put(imgLocation, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .catch(err => console.error(err))

            //after submitting go back to detail
            history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
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
                    bools[index] = bools[index] && remove[0].id !== row[0].id
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

    return (
        <div className={styles.progOverviewEditMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    {id === 'new' ? (
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
                            text={id}
                            icon='back'
                            onClick={() => {
                                history.push(`/programs/overview/${id}/${archived ? 'archived' : 'inventory'}`)
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

                    <Group justify={'between'} className={styles.row1Group}>
                        <div className={id !== 'new' ? styles.nameInput : styles.nameInputWithEdit}>
                            <div className={styles.inputText}>Program Name</div>
                            <input
                                type='text'
                                className={styles.input}
                                value={overviewInputs.name.value}
                                onChange={e =>
                                    setOverviewInputs({...overviewInputs, name: {value: e.target.value, changed: true}})
                                }
                            />
                        </div>

                        <Checkbox
                            className={styles.checkBoxContainer}
                            checked={overviewInputs.isLicense.value}
                            title={'License'}
                            onClick={() =>
                                setOverviewInputs({
                                    ...overviewInputs,
                                    isLicense: {value: !overviewInputs.isLicense.value, changed: true},
                                })
                            }
                        />

                        <div className={styles.numCopies}>
                            <div className={styles.inputText}># of Copies</div>
                            <input
                                type='number'
                                className={styles.input}
                                value={numCopies}
                                onChange={e => setNumCopies(parseInt(e.target.value))}
                            />
                        </div>

                        {id !== 'new' && (
                            <Button
                                className={styles.editButton}
                                onClick={() => {
                                    setProgramForm({add: false, edit: !programForm.edit})
                                }}
                                text={`Edit All Copies`}
                            />
                        )}
                    </Group>
                    {programForm.edit && (
                        <div className={styles.programForm}>
                            <ProgramForm state={programUpdateInput} setState={setProgramUpdateInput} />
                        </div>
                    )}

                    {id !== 'new' ? (
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
                                    setProgramForm({edit: false, add: !programForm.add})
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

                    {id !== 'new' && (
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
                    {pluginForm && id !== 'new' && (
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
    )
}
