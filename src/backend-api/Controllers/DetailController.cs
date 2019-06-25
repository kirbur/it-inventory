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

        private bool isAdmin()
        {
            try
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
                        return isAdmin;
                    }
                    else
                    {
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
                    return Ok(_context.Employee.Where(x => x.EmployeeId == id));
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
            var LicenseKeySame = !(_context.Program.Where(x => x.ProgramName == program && x.IsDeleted == false).ToList().Any(x => x.ProgramLicenseKey != _context.Program.ToList()[0].ProgramLicenseKey));

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
            foreach (var plugin in _context.Plugins)
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
    }
}
