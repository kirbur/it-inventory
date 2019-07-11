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
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)

    const [programRows, setProgramRows] = useState<ITableItem[][]>([])
    const [removedProgramRows, setRemovedProgramRows] = useState<ITableItem[][]>([])

    const [pluginRows, setPluginRows] = useState<ITableItem[][]>([])
    const [removedPluginRows, setRemovedPluginRows] = useState<ITableItem[][]>([])

    const [pluginForm, setPluginForm] = useState(false)
    const [programForm, setProgramForm] = useState(false)

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
        name: '',
        programName: nameInput,
        description: '',
        renewalDate: new Date(),
        purchaseDate: new Date(),
        purchaseLink: '',
        licenseKey: '',
        cost: 0,
        flatCost: 0,
        monthsPerRenewal: 0,
        isLicense: false,
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

                    let plug: ITableItem[][] = []
                    let plugList: IPluginInfo[] = []
                    data[0].listOfPlugins.map((i: ExpectedPluginType) => {
                        plug.push([
                            {
                                value: format(i.pluginName),
                                sortBy: format(i.pluginName),
                                id: i.pluginId,
                                tooltip: i.pluginDescription,
                            },
                            {value: formatDate(i.renewalDate), sortBy: formatDate(i.renewalDate)},
                            {
                                value: formatCost(i.isCostPerYear, i.pluginCostPerYear, i.pluginFlatCost),
                                sortBy: i.pluginCostPerYear,
                            },
                        ])

                        plugList.push({
                            id: i.pluginId ? i.pluginId : 0,
                            name: i.pluginName,
                            programName: match.params.id,
                            description: i.pluginDescription ? i.pluginDescription : '',
                            recurringCost: i.pluginCostPerYear,
                            flatCost: i.pluginFlatCost,
                            renewalDate: i.renewalDate ? new Date(i.renewalDate) : new Date(),
                            purchaseDate: i.purchaseDate ? new Date(i.purchaseDate) : new Date(),
                            monthsPerRenewal: i.isCostPerYear ? 12 : 1,
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

    const handleSubmit = () => {
        var postProgram = {
            Program: {
                numberOfPrograms: Number.isNaN(numCopies) ? 0 : numCopies,
                ProgramName: nameInput,
                ProgramCostPerYear: Number.isNaN(programInput.cost) ? 0 : programInput.cost,
                ProgramFlatCost: Number.isNaN(programInput.flatCost) ? 0 : programInput.flatCost,
                ProgramLicenseKey: programInput.licenseKey,
                IsLicense: programInput.isLicense,
                ProgramDescription: programInput.description,
                ProgramPurchaseLink: programInput.purchaseLink,
                DateBought: programInput.purchaseDate.toISOString(),
                RenewalDate: programInput.monthsPerRenewal === 0 ? null : programInput.renewalDate.toISOString(),
                MonthsPerRenewal: programInput.cost
                    ? Number.isNaN(programInput.monthsPerRenewal) || programInput.monthsPerRenewal === 0
                        ? 1 //default is monthly
                        : programInput.monthsPerRenewal
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
                axios
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
            if (programForm) {
                //TODO: post request for x# of copies w/ programInput

                postProgram.Program.ProgramName = match.params.id
                if (
                    postProgram.Program.numberOfPrograms >= 1 &&
                    (postProgram.Program.ProgramCostPerYear > 0 || postProgram.Program.ProgramFlatCost > 0) &&
                    postProgram.Program.DateBought
                ) {
                    axios
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

            if (pluginForm) {
                setPluginInput({...pluginInput, programName: nameInput})
                var postPlugin = {
                    plugin: {
                        //TODO: find out variable names from Joe
                    },
                }
                //TODO: post request for new plugin
                console.log(pluginInput)
                if (pluginInput.id === -1) {
                    //TODO: post request for new plugin
                } else {
                    //TODO: put request edit plugin
                }
            }

            //TODO: post request to delete removedPluginRows & removedProgramRows
        }

        if (imgInput && imgLocation) {
            var formData = new FormData()
            formData.append('file', imgInput)

            axios
                .put(imgLocation, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .then(data => console.log(data))
                .catch(err => console.error(err))
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

                        <div className={styles.checkBoxContainer}>
                            <div className={styles.inputText}>License</div>
                            <div
                                className={styles.checkbox}
                                onClick={() => setProgramInput({...programInput, isLicense: !programInput.isLicense})}
                            >
                                <div className={styles.check} />
                                {programInput.isLicense && <div className={styles.insideCheck} />}
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
                                    setProgramForm(!programForm)
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
                                            setPluginInput({...pluginInput, recurringCost: parseFloat(e.target.value)})
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
