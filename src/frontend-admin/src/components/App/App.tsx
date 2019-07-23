import React, {useState, useEffect} from 'react'
import {Route, NavLink, BrowserRouter as Router, Switch, Redirect} from 'react-router-dom'

// Components
import {DashboardPage} from '../pages/DashboardPage/DashboardPage'
import {DepartmentsListPage} from '../pages/DepartmentsListPage/DepartmentsListPage'
import {DepartmentDetailPage} from '../pages/DepartmentDetailPage/DepartmentDetailPage'
import {EmployeesListPage} from '../pages/EmployeesListPage/EmployeesListPage'
import {EmployeeDetailPage} from '../pages/EmployeeDetailPage/EmployeeDetailPage'
import {HardwareListPage} from '../pages/HardwareListPage/HardwareListPage'
import {HardwareDetailPage} from '../pages/HardwareDetailPage/HardwareDetailPage'
import {ProgramsListPage} from '../pages/ProgramsListPage/ProgramsListPage'
import {ProgramOverviewPage} from '../pages/ProgramOverviewPage/ProgramOverviewPage'
import {ProgramOverviewEditPage} from '../pages/ProgramOverviewPage/ProgramOverviewEditPage'
import {ProgramDetailPage} from '../pages/ProgramDetailPage/ProgramDetailPage'
import {ProgramDetailEditPage} from '../pages/ProgramDetailPage/ProgramDetailEditPage'
import {Login} from '../reusables/Login/Login'
import {HelloUser} from '../HelloUser/HelloUser'
import logo from '../../content/Images/CQL-Logo-Color.png'
import {EmployeeDetailEditPage} from '../pages/EmployeeDetailPage/EmployeeDetailEditPage'
import {DepartmentDetailEditPage} from '../pages/DepartmentDetailPage/DepartmentDetailEditPage'
import {HardwareDetailEditPage} from '../pages/HardwareDetailPage/HardwareDetailEditPage'

// Styles
import styles from './App.module.css'

//types
export interface ILoginContext {
    refreshToken: string
    accessToken: string
    validTo: string
    givenName: string
    isAdmin: boolean
}

//Login Context
export const initialValues: {
    loginContextVariables: ILoginContext
    setLoginContextVariables: any
} = {
    loginContextVariables: {
        refreshToken: '',
        accessToken: '',
        validTo: '',
        givenName: '',
        isAdmin: false,
    },
    setLoginContextVariables: () => {},
}
export const LoginContext = React.createContext(initialValues)

// Primary Component
export const App: React.FC = () => {
    useEffect(() => {
        document.title = 'CQL'
    })
    const user = localStorage.getItem('user')
    const [loginContextVariables, setLoginContextVariables] = useState(
        user
            ? JSON.parse(user)
            : {
                  refreshToken: '',
                  accessToken: '',
                  validTo: '',
                  givenName: '',
                  isAdmin: false,
              }
    )

    var contextValue = {
        loginContextVariables: loginContextVariables,
        setLoginContextVariables: setLoginContextVariables,
    }
    return (
        <LoginContext.Provider value={contextValue}>
            <div className={styles.app}>
                {/*header*/}

                <Router>
                    {loginContextVariables.givenName === '' && <Redirect to='/login' />}
                    {loginContextVariables.givenName !== '' && (
                        <div className={styles.navContainer}>
                            <HelloUser name={loginContextVariables.givenName} className={styles.helloMesssage} />
                            <nav className={styles.navBar}>
                                <img
                                    className={styles.navBarLogo}
                                    src={logo}
                                    alt={'CQL'}
                                    // onClick={() => <Redirect to='/dashboard' />}
                                />
                                <div className={styles.navEllipse} />
                                <div className={styles.navRectangle} />

                                <div className={styles.linkContainer}>
                                    <NavLink
                                        className={styles.navTab}
                                        activeClassName={styles.active}
                                        to='/departments'
                                    >
                                        <div className={styles.navTabRectangle} />
                                        <label>Departments</label>
                                    </NavLink>

                                    <NavLink className={styles.navTab} activeClassName={styles.active} to='/hardware'>
                                        <div className={styles.navTabRectangle} />
                                        <label>Hardware</label>
                                    </NavLink>

                                    <NavLink className={styles.navTab} activeClassName={styles.active} to='/programs'>
                                        <div className={styles.navTabRectangle} />
                                        <label>Programs</label>
                                    </NavLink>

                                    <NavLink className={styles.navTab} activeClassName={styles.active} to='/employees'>
                                        <div className={styles.navTabRectangle} />
                                        <label>Employees</label>
                                    </NavLink>

                                    <NavLink className={styles.navTab} activeClassName={styles.active} to='/dashboard'>
                                        <div className={styles.navTabRectangle} />
                                        <label>Dashboard</label>
                                    </NavLink>
                                </div>
                            </nav>
                        </div>
                    )}
                    <Switch>
                        {/* <Route />'s go here */}
                        <Route path='/dashboard' component={DashboardPage} />
                        <Route exact path='/employees' component={EmployeesListPage} />
                        <Route exact path='/programs' component={ProgramsListPage} />
                        <Route exact path='/hardware' component={HardwareListPage} />

                        <Route exact path='/departments' component={DepartmentsListPage} />
                        <Route exact path='/login' component={Login} />
                        <Route exact path='/' component={Login} />

                        <Route path={'/departments/detail/:id'} render={props => <DepartmentDetailPage {...props} />} />
                        <Route path={'/employees/detail/:id'} render={props => <EmployeeDetailPage {...props} />} />
                        <Route
                            path={'/hardware/detail/:type/:id'}
                            render={props => <HardwareDetailPage {...props} />}
                        />
                        <Route
                            path={'/programs/overview/:id/:archived'}
                            render={props => <ProgramOverviewPage {...props} />}
                        />
                        <Route path={'/programs/detail/:id'} render={props => <ProgramDetailPage {...props} />} />

                        {loginContextVariables.isAdmin && (
                            <Route exact path={'/employees/edit/:id'} component={EmployeeDetailEditPage} />
                        )}

                        {loginContextVariables.isAdmin && (
                            <Route
                                exact
                                path={'/departments/edit/:id'}
                                render={props => <DepartmentDetailEditPage {...props} />}
                            />
                        )}

                        {loginContextVariables.isAdmin && (
                            <Route
                                exact
                                path={'/hardware/edit/:type/:id'}
                                render={props => <HardwareDetailEditPage {...props} />}
                            />
                        )}

                        {loginContextVariables.isAdmin && (
                            <Route path={'/programs/edit/detail/:id'} component={ProgramDetailEditPage} />
                        )}

                        {loginContextVariables.isAdmin && (
                            <Route path={'/programs/edit/overview/:id/:archived'} component={ProgramOverviewEditPage} />
                        )}
                    </Switch>
                </Router>
            </div>
        </LoginContext.Provider>
    )
}
