using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            catch (IndexOutOfRangeException e)
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
                    return Ok("program");
                case "department":
                    return Ok("department");
                case "server":
                    return Ok("server");
                case "computer":
                    return Ok("laptop");
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
            foreach (var plugin in _context.Plugins.Where(x=>(!x.IsDeleted)))
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
            if (emp == null)
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
                };
                return Ok(employeeDetail);
            }
        }

    }
}
