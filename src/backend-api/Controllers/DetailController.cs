using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        private bool isAdmin()
        {
            //Take the token from the bearer header and split it from the bearer title
            var TokenList = Request.Headers["Authorization"].ToString().Split(" ");
            //turn stringifyed token into a JWT token
            var JwtToken = new JwtSecurityTokenHandler().ReadJwtToken(TokenList[1]);
            var username = JwtToken.Claims.First().Value;

            bool isAdmin = false;
            using (var adContext = new PrincipalContext(ContextType.Domain, "CQLCORP"))
            {
                var user = UserPrincipal.FindByIdentity(adContext, username);
                if (user != null)
                {
                    string adGUID = user.Guid.ToString();
                    isAdmin = _context.AuthIdserver.Where(x => x.ActiveDirectoryId == adGUID).First().IsAdmin;
                }
            }

            return isAdmin;
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

            var emp = _context.Employee.Find(id);
            if (emp == null)
            {
                return NotFound();
            }
            else
            {
                // Make sure the thing is not deleted.
                decimal totalHardwareCost = 0.0m;
                List<object> hardware = new List<object>();
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

                // Lists to return for programs.
                List<object> software = new List<object>();
                List<object> licenses = new List<object>();
                decimal totalProgramCostPerMonth = 0.0m;

                // For each program that is not deleted and is assigned to the employee
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
