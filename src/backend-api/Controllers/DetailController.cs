using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DetailController : ControllerBase
    {
        private readonly ITInventoryDBContext _context;

        public DetailController(ITInventoryDBContext context)
        {
            _context = context;
        }

        /* isAdmin determines if the username from the AccessToken is an admin user.
         *  If the user is an admin, we can choose to return specific values to the front end.
         * Return: boolean
         */
        private bool isAdmin()
        {
            // Take the bearer token string, convert it to a Jwt, and find the username from the claims.
            var TokenList = Request.Headers["Authorization"].ToString().Split(" ");

            // If there was no bearer token give, an out of range index error will be thrown.
            try
            {
                var JwtToken = new JwtSecurityTokenHandler().ReadJwtToken(TokenList[1]);
                var username = JwtToken.Claims.First().Value;

                // Check to see if the username is in our AD.
                using (var adContext = new PrincipalContext(ContextType.Domain, "CQLCORP"))
                {
                    var user = UserPrincipal.FindByIdentity(adContext, username);
                    if (user != null)
                    {
                        // Return the isAdmin field from the AuthIDServer matching the Guid.
                        string adGUID = user.Guid.ToString();
                        return _context.AuthIdserver.Where(x => x.ActiveDirectoryId == adGUID).First().IsAdmin;
                    }
                    else
                    {
                        // Return false if the user is not in AuthID.
                        return false;
                    }
                }
            }
            catch (IndexOutOfRangeException)
            {
                return false;
            }

        }

        // TODO: Abstract this reused code from this and the image controller.
        /* Change the front end to match the back end verbatim. 
         * Return: "computer" if "laptop" is matched.
         * Else: return the same string.
         */
        private string VerbatimMatch(string routeModel)
        {
            return routeModel.ToLower() == "laptop" ? "computer" : routeModel.ToLower();
        }

        /* GET: api/detail/{model}/{id}
         *      Return: 
         */
        [HttpGet]
        [Route("{model}/{id}")]
        public IActionResult GetDetail([FromRoute] string model, int id)
        {
            model = VerbatimMatch(model);

            switch (model)
            {
                case "employee":
                    return GetEmployeeDetail(id);
                case "program":
                    return GetProgramDetail(id);
                case "department":
                    return GetDepartmentDetail(id);
                case "server":
                    return Ok();
                case "computer":
                    return GetComputerDetail(model, id);
                case "monitor":
                    return Ok("monitor");
                case "peripheral":
                    return Ok("peripheral");
                default:
                    return BadRequest("Invalid Model");
            }

        }

        /* GET: api/detail/ProgramOverview/{program}
         * Function returns the program overview information     
         * Returns:{
         *          ProgramOverview:{
         *              icon: string,
         *              CountOfProgramsInUse: int,
         *              CountOfProgramsOverall: int
         *              Program(name) : string,
         *              ProgramCostFlatCost : int or null,
         *              ProgramCostPerYear : int or null,
         *              isCostPerYear : bool,
         *              ProgramLicenseKey(if Admin) : string or null
         *          },
         *          IndividualPrograms : [
         *          {
         *              programID : int,
         *              EmployeeName, string,
         *              ProgramLicenseKey(if admin) : string or null
         *              Program Renewal date : dateTime
         *          ] for all the individual programs that are part of the program overview
         *          ListOfPlugins: [
                    {
                        "pluginName": string,
                        "renewalDate": dateTime,
                        "pluginFlatCost": int,
                        "pluginCostPerYear": int,
                        "isCostPerYear": bool
                    ] for the plugins of the program overview
                    },
         *          
         *                          
         */
        [HttpGet]
        [Route("ProgramOverview/{program}")]
        public IActionResult GetProgramOverview([FromRoute] string program)
        {
            // Holds the license key of the program overview if they are all the same.
            string ProgramLicenseKey = null;
            //lambda to get the id of any of the first program with that name
            var id = _context.Program.Where(x => x.ProgramName == program).Select(x => x.ProgramId).FirstOrDefault();

            //creating string icon
            string icon = $"/images/employee/{id}";


            // list of all programs that are not deleted
            var UsefulProgramsList = _context.Program.Where(x => x.IsDeleted == false && x.ProgramName == program);

            // calculate the count of programs under this specific distinct program name that are in use
            var CountProgInUse = UsefulProgramsList.Where(x => x.ProgramName == program && x.EmployeeId != null && x.IsDeleted == false).Count();

            // calculate the count of programs under this specific distinct program name
            var CountProgOverall = UsefulProgramsList.Where(x => x.ProgramName == program).Count();

            // calculate the cost of each distinct program if it is charged yearly 
            var ProgCostPerYear = _context.Program.Where(x => x.ProgramName == program && x.ProgramCostPerYear != null && x.IsDeleted != true).Sum(x => x.ProgramCostPerYear);

            // calculate the cost of each distinct program if it is charged as a flat rate 
            var ProgFlatCost = _context.Program.Where(x => x.ProgramName == program && x.ProgramFlatCost != null && x.IsDeleted != true).Sum(x => x.ProgramFlatCost);

            // This lambda returns true if all the license keys are the same from the current program
            var LicenseKeySame = !(_context.Program.Where(x => x.ProgramName == program && x.IsDeleted == false).ToList().Any(x => x.ProgramLicenseKey != _context.Program.ToList().First().ProgramLicenseKey));

            // if all the license keys are the same then find the license key that they all are
            if (LicenseKeySame == true)
                ProgramLicenseKey = UsefulProgramsList.Select(x => x.ProgramLicenseKey).FirstOrDefault();

            // Lambda to collect all the ids of the programs that belong this program overview
            var programIds = UsefulProgramsList.Where(x => x.ProgramName == program).Select(x => x.ProgramId).ToList();

            // list to hold the individual programs from the program overview
            List<object> inDivPrograms = new List<object>();

            //loop through all the individual programs that are under of the current overview program
            foreach (var prog in UsefulProgramsList)
            {
                // holds the employee name for concatenation purposes 
                var employeeName = "";
                // Concatenating employees first and last name of the employee who owns the program if the program is assigned
                // and if the program is not deleted
                if (prog.EmployeeId != null && prog.IsDeleted == false)
                {
                    var empFirst = _context.Employee.Where(x => x.EmployeeId == prog.EmployeeId && x.IsDeleted == false).Select(x => x.FirstName).FirstOrDefault();
                    var empLast = _context.Employee.Where(x => x.EmployeeId == prog.EmployeeId && x.IsDeleted == false).Select(x => x.LastName).FirstOrDefault();
                    employeeName = empFirst + " " + empLast;
                }
                // Creating the list of individual programs with the necessary returnables. 
                // Only returning license key if the account that hits the endpoint is an admin.
                inDivPrograms.Add(new
                {
                    prog.ProgramId,
                    employeeName,
                    ProgramlicenseKey = isAdmin() ? prog.ProgramLicenseKey : null,
                    prog.RenewalDate
                });
            }
            // creating a list of plug-ins that will be returned
            List<object> ListOfPlugins = new List<object>();

            // loop through every plug-in and if they are a plug-in of the current overview program add all the info that we need about them
            // to the list of plug-ins
            foreach (var plugin in _context.Plugins.Where(x => (!x.IsDeleted)))
            {
                if (programIds.Contains(plugin.ProgramId))
                {
                    ListOfPlugins.Add(new
                    {
                        plugin.PluginName,
                        plugin.RenewalDate,
                        plugin.PluginFlatCost,
                        plugin.PluginCostPerYear,
                        plugin.IsCostPerYear
                    });
                }
            }

            // Creating the list of returnables that is for the program overview page. 
            // Again license key is only returned to an authorized user.
            var programOverview = new
            {
                icon,
                CountProgInUse,
                CountProgOverall,
                program,
                ProgFlatCost,
                ProgCostPerYear,
                UsefulProgramsList.FirstOrDefault().IsCostPerYear,
                ProgramlicenseKey = isAdmin() ? ProgramLicenseKey : null,
            };
            // returning the amalgamation of the various returnables into a nice JSON object :)
            var ProgramOverViewPage = new { programOverview, inDivPrograms, ListOfPlugins };
            return Ok(ProgramOverViewPage);
        }
        /*
         * GET: api/detail/employee/{id}
         * Function returns the employee detail information.
         * Returns: {
         *      picture: partial URL (as string),
         *      totalProgramCostPerMonth: decimal,
         *      totalHardwareCost: decimal,
         *      firstName: string,
         *      lastName: string,
         *      department: string,
         *      role: string,
         *      hireDate: date (as string),
         *      hardware: [ {
         *          id: int,
         *          type: string,
         *          make: string,
         *          model: string,
         *          serialNumber: string,
         *          mfg: string,
         *          purchaseDate: date (as string),
         *          tooltip: {
         *              ...
         *              (assortedValues as strings or ints)
         *          },
         *      } ,.. ],
         *      software: [ {
         *          id: int,
         *          name: string,
         *          licenseKey: string, //TODO
         *          costPerMonth: decimal,
         *          flatCost: decimal,
         *      } ,.. ],
         *      licenses: [ {
         *          id: int,
         *          name: string,
         *          licenseKey: string, //TODO
         *          costPerMonth: decimal,
         *          flatCost: decimal,
         *      } ,.. ],
         *  }            
         */
        private IActionResult GetEmployeeDetail(int id)
        {
            bool isAdmin = this.isAdmin();

            // Find the requested employee
            var emp = _context.Employee.Find(id);
            if (emp == null || emp.IsDeleted == true)
            {
                return NotFound();
            }
            else
            {
                // Initialize return elements.
                decimal totalHardwareCost = 0.0m;
                List<object> hardware = new List<object>();

                // For every server the employee is assigned to, create custom objects to return and add to the hardware list.
                foreach (Server sv in _context.Server.Where(server => server.EmployeeId == id && !server.IsDeleted))
                {
                    object tooltip = new
                    {
                        sv.NumberOfCores,
                        sv.Ram,
                        sv.LocalHHD,
                    };
                    object server = new
                    {
                        id = sv.ServerId,
                        type = nameof(Server),
                        sv.Make,
                        sv.Model,
                        sv.SerialNumber,
                        sv.Mfg,
                        sv.PurchaseDate,
                        tooltip,
                    };
                    hardware.Add(server);
                    totalHardwareCost += sv.FlatCost ?? 0.0m;
                }

                // For every computer the employee is assigned to, create custom objects to return and add to the hardware list.
                foreach (Computer cp in _context.Computer.Where(computer => computer.EmployeeId == id && !computer.IsDeleted))
                {
                    object tooltip = new
                    {
                        cp.Cpu,
                        cp.Ramgb,
                        cp.Ssdgb,
                    };
                    object computer = new
                    {
                        id = cp.ComputerId,
                        type = nameof(Computer),
                        cp.Make,
                        cp.Model,
                        cp.SerialNumber,
                        cp.Mfg,
                        cp.PurchaseDate,
                        tooltip,
                    };
                    hardware.Add(computer);
                    totalHardwareCost += cp.FlatCost ?? 0.0m;
                }

                // For every monitor the employee is assigned to, create custom objects to return and add to the hardware list.
                foreach (Monitor mn in _context.Monitor.Where(monitor => monitor.EmployeeId == id && !monitor.IsDeleted))
                {
                    object tooltip = new
                    {
                    };
                    object monitor = new
                    {
                        id = mn.MonitorId,
                        type = nameof(Monitor),
                        mn.Make,
                        mn.Model,
                        mn.SerialNumber,
                        mn.Mfg,
                        mn.PurchaseDate,
                        tooltip,
                    };
                    hardware.Add(monitor);
                    totalHardwareCost += mn.FlatCost ?? 0.0m;
                }

                // For every peripheral the employee is assigned to, create custom objects to return and add to the hardware list.
                foreach (Peripheral pr in _context.Peripheral.Where(peripheral => peripheral.EmployeeId == id && !peripheral.IsDeleted))
                {
                    // NOTE: Peripheral does not have make and model, but instead has name and type.
                    object tooltip = new
                    {
                    };
                    object peripheral = new
                    {
                        id = pr.PeripheralId,
                        type = nameof(Peripheral),
                        make = pr.PeripheralName,
                        model = pr.PeripheralType,
                        pr.SerialNumber,
                        pr.Mfg,
                        pr.PurchaseDate,
                        tooltip,
                    };
                    hardware.Add(peripheral);
                    totalHardwareCost += pr.FlatCost ?? 0.0m;
                }

                // Initialize elements to return for programs.
                List<object> software = new List<object>();
                List<object> licenses = new List<object>();
                decimal totalProgramCostPerMonth = 0.0m;

                // For each program that is not deleted and is assigned to the employee, create an object to add to the list.
                foreach (Models.Program prog in _context.Program.Where(prog => !prog.IsDeleted && prog.EmployeeId == id))
                {
                    decimal costPerMonth = prog.ProgramCostPerYear / 12 ?? 0.0m;
                    totalProgramCostPerMonth += costPerMonth;

                    if (prog.IsLicense)
                    {
                        object license = new
                        {
                            id = prog.ProgramId,
                            name = prog.ProgramName,
                            licensesKey = isAdmin ? prog.ProgramLicenseKey : null,
                            costPerMonth,
                            flatCost = prog.ProgramFlatCost
                        };
                        licenses.Add(license);
                    }
                    // If not a license, then a software.
                    else
                    {
                        object sw = new
                        {
                            id = prog.ProgramId,
                            name = prog.ProgramName,
                            licenseKey = isAdmin ? prog.ProgramLicenseKey : null,
                            costPerMonth,
                            flatCost = prog.ProgramFlatCost
                        };
                        software.Add(sw);
                    }
                }

                // Partial path for picture
                string picture = $"/images/employee/{id}";

                // Get the department name
                var department = _context.Department.Where(dep => dep.DepartmentId == emp.DepartmentId && !dep.IsDeleted).FirstOrDefault().DepartmentName;

                // list that will hold the unassigned hardware
                List<object> UnassignedHardware = new List<object>();

                // loop with lambda that finds the unassigned, not deleted monitors and adds the necessary returnables of them into a list 
                foreach (var mon in _context.Monitor.Where(x => x.EmployeeId == null && x.IsDeleted == false))
                {
                    var monitorName = mon.Make + " " + mon.Model;
                    var monitor = new
                    {
                        mon.MonitorId,
                        type = nameof(Monitor),
                        monitorName
                    };
                    UnassignedHardware.Add(monitor);
                }
                // loop with lambda that finds the unassigned, not deleted servers and adds the necessary returnables of them into a list 
                foreach (var serv in _context.Server.Where(x => x.EmployeeId == null && x.IsDeleted == false))
                {
                    var serverName = serv.Make + " " + serv.Model;
                    var server = new
                    {
                        serv.ServerId,
                        type = nameof(Server),
                        serverName
                    };
                    UnassignedHardware.Add(server);
                }

                // loop with lambda that finds the unassigned, not deleted computers and adds the necessary returnables of them into a list 
                foreach (var comp in _context.Computer.Where(x => x.EmployeeId == null && x.IsDeleted == false))
                {
                    var compName = comp.Make + " " + comp.Model;
                    var computer = new
                    {
                        comp.ComputerId,
                        type = nameof(Computer),
                        compName
                    };
                    UnassignedHardware.Add(computer);
                }

                // loop with lambda that finds the unassigned, not deleted peripherals and adds the necessary returnables of them into a list 
                foreach (var periph in _context.Peripheral.Where(x => x.EmployeeId == null && x.IsDeleted == false))
                {
                    var periphName = periph.PeripheralName + " " + periph.PeripheralType;
                    var peripheral = new
                    {
                        periph.PeripheralId,
                        type = nameof(Peripheral),
                        periphName
                    };
                    UnassignedHardware.Add(peripheral);
                }

                // Unassigned programs lists for returning purposes
                List<object> UnassignedSoftware = new List<object>();
                List<object> UnassignedLicenses = new List<object>();

                // loop and lambda to find all the distinct programs that have any of their individual programs unassigned and loop though them
                foreach (var prog in _context.Program.Where(x => x.EmployeeId == null && x.IsDeleted == false).GroupBy(prog => prog.ProgramName).Select(x => x.FirstOrDefault()).ToList())
                {
                    // for the licenses list
                    if (prog.IsLicense == false)
                    {
                        var SW = new
                        {
                            prog.ProgramName,
                            prog.ProgramId,
                            type = nameof(Program)
                        };
                        UnassignedSoftware.Add(SW);
                    }
                    // for the software list
                    else
                    {
                        var license = new
                        {
                            prog.ProgramName,
                            prog.ProgramId,
                            type = nameof(Program)
                        };
                        UnassignedLicenses.Add(license);
                    }
                }


                // Combine it all into a nice JSON :)
                object employeeDetail = new
                {
                    picture,
                    totalProgramCostPerMonth,
                    totalHardwareCost,
                    emp.FirstName,
                    emp.LastName,
                    department,
                    emp.Role,
                    emp.HireDate,
                    hardware,
                    software,
                    licenses,
                    UnassignedHardware,
                    UnassignedSoftware,
                    UnassignedLicenses
                };
                return Ok(employeeDetail);
            }
        }
        /*
        * GET: api/detail/program/{id}
        * Function returns the program detail information.
        * Returns: {
        *    "programName": string,
        *    "picture: partial URL (as string),
        *    "renewalDate": date,
        *    "dateBought": date,
        *    "employeeName": string,
        *    "progHistory": [
        *           {
        *        "programHistoryId": int,
        *        "currentOwnerId": int,
        *        "currentOwnerStartDate": date,
        *        "previousOwnerId": int,
        *        "programId": int,
        *        "eventName": string,
        *        "eventDescription": string
        *               ] for the events of this specific program
        *           }
        *    "programCostPerYear": int,
        *    "programFlatCost": int,
        *    "isCostPerYear": bool,
        *    "description": string,
        *    "programPurchaseLink": string
        *   }
        * 
        * 
        */
        private IActionResult GetProgramDetail(int id)
        {
            //finding the program
            var prog = _context.Program.Find(id);
            // checking if the program actually exists and isn't deleted
            if (prog == null || prog.IsDeleted == true)
            {
                return NotFound();
            }
            // if the program does exist...
            else
            {
                // Partial path for picture
                string picture = $"/images/program/{id}";


                // holds the employee name for concatenation purposes 
                var employeeName = "";
                // Concatenating employees first and last name of the employee who owns the program if the program is assigned
                // and if the program is not deleted
                if (prog.EmployeeId != null && prog.IsDeleted == false)
                {
                    var empFirst = _context.Employee.Where(x => x.EmployeeId == prog.EmployeeId && x.IsDeleted == false).Select(x => x.FirstName).FirstOrDefault();
                    var empLast = _context.Employee.Where(x => x.EmployeeId == prog.EmployeeId && x.IsDeleted == false).Select(x => x.LastName).FirstOrDefault();
                    employeeName = empFirst + " " + empLast;
                }
                // find all the events/history of the current program
                var ProgHistory = _context.ProgramHistory.Where(x => x.ProgramId == prog.ProgramId);

                // Returning the details of the program into a nice JSON object :)
                var ProgramDetails = new
                {
                    prog.ProgramId,
                    prog.ProgramName,
                    picture,
                    prog.RenewalDate,
                    prog.DateBought,
                    employeeName,
                    ProgHistory,
                    ProgramLicenseKey = isAdmin() ? prog.ProgramLicenseKey : null,
                    prog.ProgramCostPerYear,
                    prog.ProgramFlatCost,
                    prog.IsCostPerYear,
                    prog.Description,
                    prog.ProgramPurchaseLink
                };

                return Ok(ProgramDetails);
            }

        }

        /*
       * GET: api/detail/department/{id}
       * Function returns the program detail information.
       * Returns : {
       *    "departmentName": String,
       *    "totalCostOfActHardwareInDep": decimal,
       *    "totalCostOfProgramsInDep": decimal,
       *    "picture: partial URL (as string),
       *    "countempsIDsInDep": int,
       *    "jsonHardware": {
       *        DefaultHardware [
       *        ] list with all the default hardware
       *     },
       *     "jsonSoftware": {
       *        DefaultSoftware [
       *        ] list with all the default software
       *     },
       *     "listOfEmployees": [
       *        {
       *             "employeeName": string,
       *             "hireDate": date,
       *             "hardwareCostForEmp": decimal,
       *             "programCostForEmp": decimal
       *         },
       *     ], For all the employees in this department
       *      "listOfTablePrograms": [
       *         {
       *             "programName": string,
       *             "programCount": int,
       *             "programCostPerYear": decimal,
       *             "programIsCostPerYear": bool
       *         }, 
       *     ], For all the programs that owned by this department that are not licenses,
       *     "licensesList": [
       *         {
       *         "progName": string,
       *         "countOfThatLicense": int
       *         },
       *     ] For all the programs that owned by this department that are licenses
       * }
       */
        private IActionResult GetDepartmentDetail(int DepId)
        {

            //finding the department
            var dep = _context.Department.Find(DepId);
            // checking if the department actually exists and isn't deleted
            if (dep == null || dep.IsDeleted == true)
            {
                return NotFound();
            }
            // if the department does exist...
            else
            {
                // storing the partial picture url
                string picture = $"/images/department/{DepId}";

                //Cost of Programs per department value
                decimal? TotalCostOfProgramsInDep = 0;

                // cost of hardware per department value
                decimal? TotalCostOfActHardwareInDep = 0;

                // lambda to collect all the employees in the current department into a list
                var empsInDep = _context.Employee.Where(x => x.DepartmentId == DepId && x.IsDeleted == false);

                // lambda to get the ids of the all the employees in the current department
                var empsIDsInDep = empsInDep.Select(x => x.EmployeeId).ToList();

                // lambda to count the number of employees in the current department
                var CountEmpsInDep = empsInDep.Count();

                // Need to qualify Program with Models
                // so it does not conflict with Program.cs that runs the program.
                List<Models.Program> programsOfEmpsInDepartment = new List<Models.Program>();


                // Make sure the program is not deleted and the employeeID is not null
                foreach (var prog in _context.Program.Where(x => x.IsDeleted == false && x.EmployeeId != null))
                {
                    // Checks to see if the program employee ID is in the department and if it is,
                    // collect all the programs from this current department
                    if (empsIDsInDep.Contains(System.Convert.ToInt32(prog.EmployeeId)))
                    {
                        programsOfEmpsInDepartment.Add(prog);
                    }
                }

                // lambda to calculate the total cost of the programs in the current department
                TotalCostOfProgramsInDep = System.Convert.ToInt32(programsOfEmpsInDepartment.Where(x => x.IsDeleted == false && x.ProgramCostPerYear != null).Sum(x => x.ProgramCostPerYear));

                // loop to calculate the cost of monitors that employees from the current department are accumulating 
                foreach (var mon in _context.Monitor.Where(x => x.IsDeleted == false && x.FlatCost != null))
                {
                    if (empsIDsInDep.Contains(System.Convert.ToInt32(mon.EmployeeId)))
                    {
                        TotalCostOfActHardwareInDep += mon.FlatCost;
                    }
                }

                // loop to calculate the cost of computers that employees from the current department are accumulating 
                foreach (var Comp in _context.Computer.Where(x => x.IsDeleted == false && x.FlatCost != null))
                {
                    if (empsIDsInDep.Contains(System.Convert.ToInt32(Comp.EmployeeId)))
                    {
                        TotalCostOfActHardwareInDep += Comp.FlatCost;
                    }
                }

                // loop to calculate the cost of peripheral that employees from the current department are accumulating 
                foreach (var peripheral in _context.Peripheral.Where(x => x.IsDeleted == false && x.FlatCost != null))
                {
                    if (empsIDsInDep.Contains(System.Convert.ToInt32(peripheral.EmployeeId)))
                    {
                        TotalCostOfActHardwareInDep += peripheral.FlatCost;
                    }

                }

                // loop to calculate the cost of servers that employees from the current department are accumulating 
                foreach (var server in _context.Server.Where(x => x.IsDeleted == false && x.FlatCost != null))
                {
                    if (empsIDsInDep.Contains(System.Convert.ToInt32(server.EmployeeId)))
                    {
                        TotalCostOfActHardwareInDep += server.FlatCost;
                    }

                }
                // list of employees that will hold the info for the employees list that on the table as specified in the method comment header
                var ListOfEmployees = new List<object>();


                // loop through all the employees and find how much they are costing individually costing in their programs and hardware
                foreach (var emp in empsInDep.Where(x => x.IsDeleted == false))
                {
                    // Sum the costs of all the computers owned by the current employee where the computer is not deleted and the cost is not null
                    var CostComputerOwnedByEmployee = _context.Computer.Where(x => x.EmployeeId == emp.EmployeeId && x.FlatCost != null && x.IsDeleted != true).Sum(x => x.FlatCost);

                    // Sum the costs of all the peripherals owned by the current employee where the peripheral is not deleted and the cost is not null
                    var CostPeripheralOwnedByEmployee = _context.Peripheral.Where(x => x.EmployeeId == emp.EmployeeId && x.FlatCost != null && x.IsDeleted != true).Sum(x => x.FlatCost);

                    // Sum the costs of all the monitors owned by the current employee where the monitor is not deleted and the cost is not null
                    var CostMonitorOwnedByEmployee = _context.Monitor.Where(x => x.EmployeeId == emp.EmployeeId && x.FlatCost != null && x.IsDeleted != true).Sum(x => x.FlatCost);

                    // Sum the costs of all the servers owned by the current employee where the server is not deleted and the cost is not null
                    var CostServerOwnedByEmployee = _context.Server.Where(x => x.EmployeeId == emp.EmployeeId && x.FlatCost != null && x.IsDeleted != true).Sum(x => x.FlatCost);

                    //Adding up all the costs into one variable
                    var HardwareCostForEmp = CostComputerOwnedByEmployee + CostMonitorOwnedByEmployee + CostPeripheralOwnedByEmployee + CostServerOwnedByEmployee;

                    // Sum the costs of all the programs that are charged as cost per year owned by the current employee where the program is not deleted and the cost is not null
                    var ProgCostForEmpPerYear = _context.Program.Where(x => x.EmployeeId == emp.EmployeeId && x.ProgramCostPerYear != null && x.IsDeleted != true).Sum(x => x.ProgramCostPerYear);

                    // Dividing the yearly cost into months Adding the programs costs into one variable if the values are not null
                    decimal ProgramCostForEmp = Math.Round(System.Convert.ToDecimal(ProgCostForEmpPerYear / 12), 2, MidpointRounding.ToEven);

                    // concatenating the first and the last name
                    var EmployeeName = emp.FirstName + " " + emp.LastName;

                    // building employee object
                    var Employee = new
                    {
                        EmployeeName,
                        emp.HireDate,
                        HardwareCostForEmp,
                        ProgramCostForEmp
                    };

                    ListOfEmployees.Add(Employee);
                }



                // Make a list of the distinct programs of the employees
                // in the department.
                var distinctPrograms = programsOfEmpsInDepartment.Where(x => x.IsLicense == false).GroupBy(prog => prog.ProgramName).Select(name => name.FirstOrDefault()).Select(program => program.ProgramName);

                // Create a list with name, count, costPerYear containing the unique programs in the department
                List<DepartmentTableProgram> listOfTablePrograms = new List<DepartmentTableProgram>();
                foreach (var name in distinctPrograms)
                {
                    // Construct a new object to be added to the list.
                    listOfTablePrograms.Add(new DepartmentTableProgram(name, 0, 0.0m, true));
                }

                // Aggregate the programs in the department that are the same name.
                // Count the programs and add the cost.
                foreach (Models.Program departmentProgram in programsOfEmpsInDepartment.Where(x => x.IsLicense == false))
                {
                    // The index of the unique program that has the same name as the employee's program in the department
                    int index = listOfTablePrograms.FindIndex(uniqueProgram => uniqueProgram.ProgramName == departmentProgram.ProgramName);
                    if (index >= 0)
                    {
                        listOfTablePrograms[index].ProgramCount += 1;
                        // ?? operator to make sure CostPerYear is not null. If it is, add 0.
                        listOfTablePrograms[index].ProgramCostPerYear += departmentProgram.ProgramCostPerYear ?? 0.0m;
                        listOfTablePrograms[index].ProgramIsCostPerYear = departmentProgram.IsCostPerYear ? true : false;
                    }
                }

                // lambda to find the distinct licenses from all the programs
                var distinctLicensePrograms = programsOfEmpsInDepartment.Where(x => x.IsLicense == true).GroupBy(prog => prog.ProgramName).Select(name => name.FirstOrDefault()).Select(program => program.ProgramName).ToList();

                // list that will contain the licenses and how many licenses this current department is using
                List<object> LicensesList = new List<object>();

                // loop though distinct licenses name and count how many programs that belong to this current have that specific name
                foreach (var progName in distinctLicensePrograms)
                {
                    var CountOfThatLicense = programsOfEmpsInDepartment.Where(x => x.IsDeleted == false && x.IsLicense == true && x.ProgramName == progName).Count();

                    // creating license object that contains the necessary returnables.
                    var License = new
                    {
                        progName,
                        CountOfThatLicense
                    };
                    LicensesList.Add(License);
                }
                // pull stringifyed default hardware and software out into a nice JSON object :) using JSON package.
                JObject jsonHardware = JObject.Parse(dep.DefaultHardware);
                JObject jsonPrograms = JObject.Parse(dep.DefaultPrograms);

                // creating list of necessary returnables that are specified in the method comment header
                var DepartmentDetailPage = new
                {
                    dep.DepartmentName,
                    TotalCostOfActHardwareInDep,
                    TotalCostOfProgramsInDep,
                    picture,
                    CountEmpsInDep,
                    jsonHardware,
                    jsonPrograms,
                    ListOfEmployees,
                    listOfTablePrograms,
                    LicensesList
                };
                return Ok(DepartmentDetailPage);
            }
        }
        /*
         * GET: api/detail/computer/{id}
       * Function returns the program detail information.
       * Returns : {
       *    "computer": {
                "serverId": int,
                "fqdn": string,
                "numberOfCores": int,
                "operatingSystem": string,
                "ram": int,
                "virtualize": bool,
                "renewalDate": date,
                "employeeId": int,
                "purchaseDate": date,
                "flatCost": int,
                "endOfLife": date,
                "isAssigned": bool,
                "textField": string,
                "costPerYear": int,
                "isDeleted": bool,
                "mfg": string,
                "make": string,
                "model": string,
                "ipAddress": string,
                "san": string,
                "localHHD": string,
                "location": string,
                "serialNumber": string
            },
            "icon": partial URL (as string),
            "employeeAssignedName": string,
            "compHistory": [
                {
                "hardwareHistoryId": int,
                "currentOwnerId": int,
                "currentOwnerStartDate": string,
                "previousOwnerId": int,
                "hardwareType": string,
                "hardwareId": int,
                "eventName": string,
                "eventDescription": string
                }
            ]
        }
       */
        private IActionResult GetComputerDetail(string model, int ComputerID)
        {
            // Find the requested server
            var comp = _context.Server.Find(ComputerID);
            if (comp == null || comp.IsDeleted == true)
            {
                return NotFound();
            }
            else
            {
                // Partial image string
                var icon = $"/image/laptop/{ComputerID}";

                // Employee the computer is assigned to.
                var employeeAssigned = _context.Employee.Where(x => x.EmployeeId == comp.EmployeeId).FirstOrDefault();

                // Computer History
                var compHistory = _context.HardwareHistory.Where(x => x.HardwareType.ToLower() == model && x.HardwareId == ComputerID);

                return Ok(new
                {
                    computer = comp,
                    icon,
                    employeeAssignedName =employeeAssigned != null ? employeeAssigned.FirstName + " " + employeeAssigned.LastName : "",
                    compHistory,
                });
            }
        }
    }
}
