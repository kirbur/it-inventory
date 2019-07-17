using backend_api.Models;
using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        public readonly ITInventoryDBContext _context;

        public DashboardController(ITInventoryDBContext context)
        {
            _context = context;
        }

        // A helper class that is a cost breakdown object.
        public class CostBreakDown
        {
            public CostBreakDown() { }
            public decimal? CostOfProgramsPerYear { get; set; }
            public decimal? CostOfPluginsPerYear { get; set; }
        }

        /* GET: api/dashboard/CostBreakDown
         * Returns [ {
         *          ProgramCostPerYear: int,
         *          PluginCostPerYear: int,
         *          } ,.. ] which is comprised of all the programs and their plugins in our database
         */
        [Route("CostBreakdown")]
        [HttpGet]
        public ActionResult<object> GetDashboardCostBreakDown()
        {
            // Return the object as an array so the axios service class will be happy.
            return new List<object> { DashboardCostBreakDown() };
        }

        /* DashboardCostBreakdown() is a helper method used for calculating the cost breakdown cards
         *   on the dashboard. 
         * Returns [ {
         *           ProgramCostPerYear: int,
         *           PluginCostPerYear: int,
         *          } ,.. ] which is comprised of all the programs and their plugins in our database
         */
        public CostBreakDown DashboardCostBreakDown()
        {
            //Array that will be returned with Programs cost and plugins cost
            decimal?[] ReturningArray = new decimal?[2];

            //Getting cost from the program table

            var ProgramsList = _context.Program.ToList();

            decimal? CostOfProgramsPerYear = 0;
            // looping through programs table and finding programs that are not "deleted" 
            // and that are not null. Adding up the cost of those programs
            foreach (var Program in ProgramsList)
            {
                if (Program.IsDeleted == false && Program.ProgramCostPerYear != null)
                {
                    CostOfProgramsPerYear += Program.ProgramCostPerYear;
                }
            }

            //getting cost from plugin table

            decimal? CostOfPluginsPerYear = 0;
            var PluginsList = _context.Plugins.ToList();
            //Selecting distinct programs by name so that they match up with the plugin table

            var DistinctProgramsList = ProgramsList.GroupBy(x => x.ProgramName).Select(x => x.FirstOrDefault());
            //looping through those distinct programs and if they have plugins, calculating the cost of these plugins
            foreach (var Program in DistinctProgramsList)
            {
                if (Program.HasPlugIn == true)
                {
                    //creating a list of plugins for that program which are not deleted
                    var PluginsForThatProgram = PluginsList.Where(x => x.ProgramId == Program.ProgramId && x.IsDeleted == false);
                    foreach (var PluginForThatProgram in PluginsForThatProgram)
                    {
                        CostOfPluginsPerYear += PluginForThatProgram.PluginCostPerYear;

                    }
                }
            }
            return new CostBreakDown
            {
                CostOfProgramsPerYear = CostOfProgramsPerYear,
                CostOfPluginsPerYear = CostOfPluginsPerYear
            };
            
        }

        /* GET: api/dashboard/CostPieCharts
        * Returns [
        *          {
        *           HeadingName: Software,
        *           data
        *           [
        *            Name of Department,
        *            Cost of Software in use of department
        *            ID of department
        *           ] of all the programs for all the departments in our database except the Utilities department
        *          }
        *          {
        *           [
        *           HeadingName: Hardware,
        *           data2
        *           [
        *           Name of Department,
        *           Cost of Active Hardware,
        *           ID of department
        *           ] of all the hardware for all the departments in our database except the Utilities department
        *          } 
        *          ]
        */
        [Route("CostPieCharts")]
        [HttpGet]
        [EnableQuery()]
        public async Task<ActionResult<object>> GetDashboardPieCharts()
        {
            // Removing the Utilities department from the list of the departments
            var Departments = _context.Department.Where(x => x.DepartmentName != "Utilities" && x.IsDeleted == false);

            // Instantiating the Pie charts list with the two data lists which will be used to return the data
            // in the correct format
            var PieChartsList = new List<object>();
            List<object> data = new List<object>();
            List<object> data2 = new List<object>();

            //looping through each department and finding program and hardware cost per department 
            foreach (var Department in Departments)
            {
                //Cost of Programs per department value
                decimal? CostOfPrograms = 0;
                decimal? CostOfHardware = 0;

                // Get the Employees table and make a list to hold each EmployeeID. 
                var allEmployees = await _context.Employee.ToListAsync();
                List<int?> employeeIDsInDepartment = new List<int?>();

                // Gets the employees that are in the department requested. 
                foreach (Employee emp in allEmployees)
                {
                    if (emp.DepartmentID == Department.DepartmentId)
                    {
                        // Adds the IDs of each of the employees.
                        employeeIDsInDepartment.Add(emp.EmployeeId);
                    }
                }

                // Need to qualify Program with Models
                // so it does not conflict with Program.cs that runs the program.
                List<Models.Program> programsOfEmpsInDepartment = new List<Models.Program>();

                //Calculating data for Programs pie chart

                foreach (var prog in _context.Program)
                {
                    // Make sure the program is not deleted.
                    if (prog.IsDeleted == false)
                    {
                        // Checks to see if the program employee ID is in the department.
                        if (employeeIDsInDepartment.Contains(prog.EmployeeId))
                        {
                            programsOfEmpsInDepartment.Add(prog);
                        }
                    }
                }

                // Calculating the costs of the all the programs that the current department is using
                foreach (var prog in programsOfEmpsInDepartment)
                {
                    //checking whether the program has a recurring cost and adding it to cost
                    if (prog.ProgramCostPerYear != null)
                    {
                        CostOfPrograms += prog.ProgramCostPerYear;
                    }
                    // using to make sure no null pointer on date bought 
                    if (prog.DateBought != null)
                    {
                        //adding 30 days to the date bought and then checking if we are now past those 30 days
                        //if we are not then add the cost of the recent software purchase
                        DateTime? startDate = prog.DateBought;
                        DateTime? relevantDate = startDate.Value.AddDays(30);
                        if (!(DateTime.Now > relevantDate))
                        {
                            CostOfPrograms += prog.ProgramFlatCost;
                        }
                    }

                }
                // Adding to the data list with the appropriate data to be returned in this list
                data.Add(new { Department.DepartmentName, CostOfPrograms, Department.DepartmentId });

                //Calculating data for Hardware pie chart

                foreach (var mon in _context.Monitor)
                {
                    if (employeeIDsInDepartment.Contains(mon.EmployeeId))
                    {
                        //adding 30 days to the date bought and then checking if we are now past those 30 days
                        //if we are not, add cost of monitor to Cost total
                        DateTime? startDate = mon.PurchaseDate;
                        DateTime? relevantDate = startDate.Value.AddDays(30);
                        if (!(DateTime.Now > relevantDate))
                        {
                            CostOfHardware += mon.FlatCost;
                        }
                    }
                }

                foreach (var Comp in _context.Computer)
                {
                    if (employeeIDsInDepartment.Contains(Comp.EmployeeId))
                    {
                        //adding 30 days to the date bought and then checking if we are now past those 30 days
                        //if we are not, add cost of Computer to Cost total
                        DateTime? startDate = Comp.PurchaseDate;
                        DateTime? relevantDate = startDate.Value.AddDays(30);
                        if (!(DateTime.Now > relevantDate))
                        {
                            CostOfHardware += Comp.FlatCost;
                        }
                    }
                }

                foreach (var peripheral in _context.Peripheral)
                {
                    if (employeeIDsInDepartment.Contains(peripheral.EmployeeId))
                    {
                        //adding 30 days to the date bought and then checking if we are now past those 30 days
                        //if we are not, add cost of peripheral to Cost total
                        DateTime? startDate = peripheral.PurchaseDate;
                        DateTime? relevantDate = startDate.Value.AddDays(30);
                        if (!(DateTime.Now > relevantDate))
                        {
                            CostOfHardware += peripheral.FlatCost;
                        }
                    }
                }

                // Adding to the data2 list with the appropriate data to be returned in this list
                data2.Add(new { Department.DepartmentName, CostOfHardware, Department.DepartmentId });
            }
            //formatting data for front end
            string headingName = "Software";
            PieChartsList.Add(new { headingName, data });
            headingName = "Hardware";
            PieChartsList.Add(new { headingName, data2 });

            return Ok(PieChartsList);
        }

        // GET: api/dashboard/departmentTable
        // To query only the name and id, use the route below.
        // GET: api/dashboard/departmentTable?$select=departmentName,departmentID
        // Return is a list of departments and their ID's.
        [Route("departmentTable")]
        [HttpGet]
        [EnableQuery()]
        public IActionResult GetDepartment()
        {
            return Ok(_context.Department.Where(x => x.IsDeleted == false).ToList());
        }

        /* GET: api/dashboard/departmentTable/{departmentID}
         * Returns [ {
         *              ProgramName : String,
         *              ProgramCount : Int,
         *              ProgramCostPerYear : Decimal,
         *              ProgramIsCostPerYear : Bool,
         *          },.. ] of the programs in the department.
         *          
         * If IsCostPerYear is false, then the front end will say 'projected'
         *  for the yearly cost.
         */
        // NOTE: The plugin cost is not included in this table.
        [HttpGet]
        [Route("departmentTable/{departmentID}")]
        public IActionResult GetDepartmentPrograms([FromRoute] int departmentID)
        {

            // Get the Employees table and make a list to hold each EmployeeID. 
            var allEmployees = _context.Employee;
            List<int?> employeeIDsInDepartment = new List<int?>();

            // Gets the employees that are in the department requested. 
            foreach (Employee emp in allEmployees)
            {
                if (emp.DepartmentID == departmentID)
                {
                    // Adds the IDs of each of the employees.
                    employeeIDsInDepartment.Add(emp.EmployeeId);
                }
            }

            var allPrograms = _context.Program;
            // Need to qualify Program with Models
            // so it does not conflict with Program.cs that runs the program.
            List<Models.Program> programsOfEmpsInDepartment = new List<Models.Program>();

            // For each program, add to the list of department programs if an employee in the 
            // department owns that program.
            foreach (Models.Program prog in allPrograms)
            {
                // Make sure the program is not deleted.
                if (prog.IsDeleted == false)
                {
                    // Checks to see if the program employee ID is in the department.
                    if (employeeIDsInDepartment.Contains(prog.EmployeeId))
                    {
                        programsOfEmpsInDepartment.Add(prog);
                    }
                }
            }

            // Make a list of the distinct programs of the employees
            // in the department.
            var distinctPrograms = programsOfEmpsInDepartment.GroupBy(prog => prog.ProgramName).Select(name => name.FirstOrDefault()).Select(program => program.ProgramName);

            // Create a list with name, count, costPerYear containing the unique programs in the department
            List<DepartmentTableProgram> listOfTablePrograms = new List<DepartmentTableProgram>();
            foreach (var name in distinctPrograms)
            {
                // Construct a new object to be added to the list.
                listOfTablePrograms.Add(new DepartmentTableProgram(name, 0, 0.0m, true));
            }

            // Aggregate the programs in the department that are the same name.
            // Count the programs and add the cost.
            foreach (Models.Program departmentProgram in programsOfEmpsInDepartment)
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

            // Strip programs from list that cost 0.
            // Programs that cost 0 will be put under the Utilities with the utility cost.
            foreach (DepartmentTableProgram tableProgram in listOfTablePrograms.ToList())
            {
                if (tableProgram.ProgramCostPerYear <= 0)
                {
                    listOfTablePrograms.Remove(tableProgram);
                }
            }

            return Ok(listOfTablePrograms);
        }

        /* GET: api/dashboard/LicenseTable
        * Returns [
        *          Program name,
        *          Count of all the current programs with that name in use
        *          Count of all the current programs with that name overall
        *] of all programs which are specified as licenses 
        */
        [Route("LicenseTable")]
        [HttpGet]
        [EnableQuery()]
        public ActionResult<object> GetLicenses()
        {
            // Make sure there is an employee.
            if (_context.Employee.Count() < 1)
            {
                return BadRequest("No employees");
            }

            var UsefulProgramsList = _context.Program.Where(x => x.IsPinned == true && x.IsLicense == true && x.IsDeleted == false);

            //temp list to hold the list with the difference field
            List<LicenseBarGraph> ThrowAwayList = new List<LicenseBarGraph>();

            //This List takes the usefulPrograms list and makes it distinct
            var DistinctUsefulPrograms = UsefulProgramsList.GroupBy(x => x.ProgramName).Select(x => x.FirstOrDefault());


            //Loop through every program in the distinct programs list
            foreach (var prog in DistinctUsefulPrograms)
            {
                //First lambda counts all the programs in the useful program list where the name is the same as the 
                //name in the distinct programs list
                var CountProgOverall = UsefulProgramsList.Where(x => x.ProgramName == prog.ProgramName).Count();
                //Second lambda counts all the programs in the useful program list where the name is the same as the 
                //name in the distinct programs list and where the license is being used
                var CountProgInUse = UsefulProgramsList.Where(x => x.ProgramName == prog.ProgramName && x.EmployeeId != null).Count();
                //adding all the necessary returnables(is that a word?)
                int difference = CountProgOverall - CountProgInUse;
                ThrowAwayList.Add(new LicenseBarGraph(prog.ProgramName, CountProgInUse, CountProgOverall, difference));
            }
            //List which sorts programs by how many they have left which are not in use;
            //Ordered with having the license with least left at the top
            var SortedList = ThrowAwayList.OrderBy(x => x.Difference);

            //removing the difference field from the List which was needed to utilise Linq's order by
            var RemovedDifferenceList = new List<object>();
            foreach (var prog in SortedList)
            {
                RemovedDifferenceList.Add(new { prog.ProgramName, prog.CountProgInUse, prog.CountProgOverall });
            }
            return Ok(RemovedDifferenceList);

            // TODO: Should this function only display what the user settings want,
            // or should it also auto fill with the licenses closest to running out?
        }

        /* GET: api/dashboard/softwareTable
         * Return = [
         *          { softwareName : string
         *            numberOfUsers : int
         *            perMonth: decimal
         *            perYear : decimal
         *            isProjected : bool
         *            isPinned : bool
         *          }, ... ]
         *   NOTE: isProjected = true when the costPerYear is false.
         *   Will return the object with the programs sorted first
         *      by the user settings, and then the most recently
         *      changed programs on the ProgramHistoryTable.
         */
        [HttpGet]
        [Route("softwareTable")]
        public IActionResult GetSoftwareTable()
        {
            // Make sure there is an employee.
            if (_context.Employee.Count() < 1)
            {
                return BadRequest("No Employees");
            }

            // making list of string of the software that is to be pinned
            var list = _context.Program.Where(x=>x.IsPinned == true && x.IsLicense == false && x.IsDeleted == false).GroupBy(x => x.ProgramName).Select(x => x.FirstOrDefault()).Select(x=>x.ProgramName).ToList();

            // Only software, not licenses. Nothing deleted. Only ones in use.
            var software = _context.Program.Where(program => program.IsLicense == false && program.IsDeleted == false && program.EmployeeId != null);

            /* TODO: Update the programHistory model to have an event Date. Same with the start hardwareHistory.
            *  TODO: Add the program name field to the programHistory. Would make this a lot easier.
            *  TODO: This is a stupidly complicated way to get the
            *  desired data.
            */
            // Sorts the program history with the most recent changes.
            var programHistory = _context.ProgramHistory.ToList();
            var sortedProgramHistory = programHistory.OrderByDescending(ph => ph.EventDate);

            // Create a list of programs that have the programs with the most recent changes first.
            List<Models.Program> sortedSoftware = new List<Models.Program>();
            List<Models.Program> noSoftwareHistory = new List<Models.Program>();
            foreach (ProgramHistory sph in sortedProgramHistory)
            {
                foreach (Models.Program prog in software)
                {
                    // Is the history entry matches to software, add it.
                    if (sph.ProgramId == prog.ProgramId)
                    {
                        sortedSoftware.Add(prog);
                    }
                }
            }

            // If there is no history for a program, then add it.
            foreach (Models.Program prog in software)
            {
                if (!sortedSoftware.Contains(prog))
                    noSoftwareHistory.Add(prog);
            }

            // Combine the lists.
            sortedSoftware.AddRange(noSoftwareHistory);

            // List of distinct software
            var distinctSortedSoftware = sortedSoftware.GroupBy(prog => prog.ProgramName).Select(name => name.FirstOrDefault());

            // All of the software names that are on the settings list.
            var distinctPinnedSoftware = software.Where(sw => list.Contains(sw.ProgramName)).GroupBy(sw => sw.ProgramName).Select(name => name.FirstOrDefault());
            var distinctPinnedSoftwareNames = distinctPinnedSoftware.Select(program => program.ProgramName);

            // List of distinct software
            var distinctSoftware = software.GroupBy(prog => prog.ProgramName).Select(name => name.FirstOrDefault());

            // Create a list of the distinct software table objects to return.
            List<SoftwareTableItem> listOfTableSoftware = new List<SoftwareTableItem>();

            // Add the pinned software (from the user settings) to the table software list first.
            foreach (Models.Program sw in distinctPinnedSoftware)
            {
                listOfTableSoftware.Add(new SoftwareTableItem(sw.ProgramName, 0, 0, 0, sw.IsCostPerYear ? false : true, true));
            }

            // Add the software to the list if it is not already int the list. Limit the list length to 10.
            // NOTE: If the user settings specify more than 10, it will display all of them.
            foreach (Models.Program sw in distinctSortedSoftware)
            {
                if (!(distinctPinnedSoftwareNames.Contains(sw.ProgramName)) && listOfTableSoftware.Count < 10)
                {
                    listOfTableSoftware.Add(new SoftwareTableItem(sw.ProgramName, 0, 0, 0, sw.IsCostPerYear ? false : true, false));
                }
            }

            // Count up the users of each software, and calculate the price. 
            foreach (Models.Program sw in software)
            {
                // Find the item in the return object that matches the software.
                int index = listOfTableSoftware.FindIndex(uniqueSoftware => uniqueSoftware.softwareName == sw.ProgramName);
                if (index >= 0)
                {
                    listOfTableSoftware[index].numberOfUsers += 1;
                    // ?? operator to make sure costPerYear is not null. If it is, add 0.
                    listOfTableSoftware[index].costPerYear += sw.ProgramCostPerYear ?? 0.0m;
                    listOfTableSoftware[index].costPerMonth += sw.ProgramCostPerYear / 12 ?? 0.0m;
                }
            }

            // Round to 4 decimals because division can be weird.
            foreach (SoftwareTableItem sw in listOfTableSoftware)
            {
                sw.costPerMonth = Math.Round(sw.costPerMonth, 4);
            }

            return Ok(listOfTableSoftware);

            // TODO: This includes software from the Utilities department.
            // Do we take it out like the pie charts above?
        }
    }
}
