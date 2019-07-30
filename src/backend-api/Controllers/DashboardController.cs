﻿using backend_api.Helpers;
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
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ContextController
    {
        public DashboardController(ITInventoryDBContext context) : base(context) { }

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
            decimal? CostOfPluginsPerYear = 0;
            decimal? CostOfProgramsPerYear = 0;

            //Getting cost from the program table

            // looping through programs table and finding programs that are not "deleted" 
            // and that are not null. Adding up the cost of those programs
            _context.Program.Where(x => x.IsDeleted == false && x.ProgramCostPerYear != null).ToList().ForEach(x => CostOfProgramsPerYear += x.ProgramCostPerYear);

            //getting cost from plugin table

            //Selecting distinct programs by name so that they match up with the plugin table

            var DistinctProgramsList = _context.Program.GroupBy(x => x.ProgramName).Select(x => x.FirstOrDefault());
            //looping through those distinct programs and if they have plugins, calculating the cost of these plugins
            foreach (var Program in DistinctProgramsList)
            {
                if (Program.HasPlugIn == true)
                {
                    //creating a list of plugins for that program which are not deleted
                    _context.Plugins
                        .Where(x => x.ProgramId == Program.ProgramId && x.IsDeleted == false)
                        .ToList()
                        .ForEach(x => CostOfPluginsPerYear += x.PluginCostPerYear);
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
        public IActionResult GetDashboardPieCharts()
        {

            // Instantiating the Pie charts list with the two data lists which will be used to return the data
            // in the correct format
            var PieChartsList = new List<object>();
            List<object> dataForPrograms = new List<object>();
            List<object> dataForHardware = new List<object>();

            // Removing the Utilities department from the list of the departments
            //looping through each department and finding program and hardware cost per department 
            foreach (var Department in _context.Department
                .Where(x => x.DepartmentName != "Utilities" &&
                x.DepartmentName != "Unassigned" && x.IsDeleted == false))
            {
                //Cost of Programs per department value
                decimal? CostOfPrograms = 0;
                decimal? CostOfHardware = 0;

                // Get the Employees table and make a list to hold each EmployeeID. 
                List<int> employeeIDsInDepartment = new List<int>();

                // Gets the employees that are in the department requested. 
                _context.Employee
                     .Where(x => x.DepartmentID == Department.DepartmentId)
                     .Where(x => x.IsDeleted == false)
                     .ToList()
                     .ForEach(x => employeeIDsInDepartment.Add(x.EmployeeId));


                // Need to qualify Program with Models
                // so it does not conflict with Program.cs that runs the program.
                List<Models.Program> programsOfEmpsInDepartment = new List<Models.Program>();

                // Calculating data for Programs pie chart
                // Make sure the program is not deleted.
                // Checks to see if the program employee ID is in the department.
                _context.Program
                    .Where(x => x.IsDeleted == false && x.EmployeeId != null)
                    .Where(x => employeeIDsInDepartment.Contains(x.EmployeeId.Value))
                    .ToList()
                    .ForEach(x => programsOfEmpsInDepartment.Add(x));

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
                        if (DateTime.Now <= relevantDate && DateTime.Now >= prog.DateBought)
                        {
                            CostOfPrograms += prog.ProgramFlatCost;
                        }
                    }

                }
                // Adding to the data list with the appropriate data to be returned in this list
                dataForPrograms.Add(
                    new
                    {
                        Department.DepartmentName,
                        CostOfPrograms,
                        Department.DepartmentId
                    });

                //Calculating data for Hardware pie chart

                CostOfHardware += CalculatedHardwareCost<Monitor>(employeeIDsInDepartment);
                CostOfHardware += CalculatedHardwareCost<Peripheral>(employeeIDsInDepartment);
                CostOfHardware += CalculatedHardwareCost<Computer>(employeeIDsInDepartment);

                // Adding to the data2 list with the appropriate data to be returned in this list
                dataForHardware.Add(
                    new
                    {
                        Department.DepartmentName,
                        CostOfHardware,
                        Department.DepartmentId
                    });
            }
            //formatting data for front end
            string headingName = "Software";
            PieChartsList.Add(new { headingName, dataForPrograms });
            headingName = "Hardware";
            PieChartsList.Add(new { headingName, dataForHardware });

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
            return Ok(_context.Department
                .Where(x => x.IsDeleted == false)
                .ToList());
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
            List<int> employeeIDsInDepartment = new List<int>();

            // Gets the employees that are in the department requested. 
            _context.Employee
                .Where(x => x.DepartmentID == departmentID && x.IsDeleted == false)
                .ToList()
                .ForEach(x => employeeIDsInDepartment.Add(x.EmployeeId));

            // Need to qualify Program with Models
            // so it does not conflict with Program.cs that runs the program.
            List<Models.Program> programsOfEmpsInDepartment = new List<Models.Program>();

            // For each program, add to the list of department programs if an employee in the 
            // department owns that program.
            _context.Program
                .Where(x => x.IsDeleted == false)
                .Where(x => employeeIDsInDepartment.Contains(x.EmployeeId.Value))
                .ToList()
                .ForEach(x => programsOfEmpsInDepartment.Add(x));


            // Make a list of the distinct programs of the employees
            // in the department.
            var distinctPrograms = programsOfEmpsInDepartment
                .GroupBy(prog => prog.ProgramName)
                .Select(name => name.FirstOrDefault())
                .Select(program => program.ProgramName);

            // Create a list with name, count, costPerYear containing the unique programs in the department
            List<DepartmentTableProgram> listOfTablePrograms = new List<DepartmentTableProgram>();
            distinctPrograms
                .ToList()
                .ForEach(name => listOfTablePrograms.Add(new DepartmentTableProgram(name, 0, 0.0m, true)));

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
            var ListOfLicenses = _context.Program
                .Where(x => x.IsLicense == true)
                .Where(x => x.IsDeleted == false);

            var UsefulProgramsList = _context.Program
                .Where(x => x.IsPinned == true)
                .Where(x => x.IsLicense == true)
                .Where(x => x.IsDeleted == false);

            //temp list to hold the list with the difference field
            List<LicenseBarGraph> ThrowAwayList = new List<LicenseBarGraph>();

            //temp list to hold the list with the difference field of the programs that are pinned.
            List<LicenseBarGraph> ThrowAwayPinnedList = new List<LicenseBarGraph>();

            //This List takes the LicensesList and makes it distinct
            var DistinctUsefulPrograms = ListOfLicenses
                .GroupBy(x => x.ProgramName)
                .Select(x => x.FirstOrDefault());


            //Loop through every program in the distinct programs list
            foreach (var prog in DistinctUsefulPrograms)
            {
                //First lambda counts all the programs in the useful program list where the name is the same as the 
                //name in the distinct programs list
                var CountProgOverall = ListOfLicenses
                    .Where(x => x.ProgramName == prog.ProgramName)
                    .Count();

                //Second lambda counts all the programs in the useful program list where the name is the same as the 
                //name in the distinct programs list and where the license is being used
                var CountProgInUse = ListOfLicenses
                    .Where(x => x.ProgramName == prog.ProgramName && x.EmployeeId != null)
                    .Count();

                //adding all the necessary returnables(is that a word?)
                int difference = CountProgOverall - CountProgInUse;

                // if the program is pinned add to our pinned list
                if (prog.IsPinned == true)
                {
                    ThrowAwayPinnedList.Add(new LicenseBarGraph(
                        prog.ProgramName,
                        CountProgInUse,
                        CountProgOverall,
                        difference
                    ));

                }
                // else add it to our non pinned list
                else
                {
                    ThrowAwayList.Add(new LicenseBarGraph(
                        prog.ProgramName,
                        CountProgInUse,
                        CountProgOverall,
                        difference
                    ));
                }
            }


            //List which sorts the unpinned programs by how many they have left which are not in use;
            //Ordered with having the license with least left at the top
            //only take 3. This can be changed
            var SortedNotPinnedList = ThrowAwayList.OrderBy(x => x.Difference).Take(3);

            // checking the programs that are not pinned and adding them to the pinned list if they are not already there
            var ThrowAwayListNames = ThrowAwayPinnedList.Select(x => x.ProgramName).ToList();
            foreach(var prog in SortedNotPinnedList)
            {
                if (!(ThrowAwayListNames.Contains(prog.ProgramName)))
                {
                    ThrowAwayPinnedList.Add(prog);
                }
            }
            // sort the new list of both the pinned and the non pinned licenses.
            var SortedList = ThrowAwayPinnedList.OrderBy(x => x.Difference);

            //removing the difference field from the List which was needed to utilize Linq's order by
            // we does this by creating the same object but this time without the differences field
            var RemovedDifferenceList = new List<object>();
            foreach (var prog in SortedList)
            {
                RemovedDifferenceList.Add(new
                {
                    prog.ProgramName,
                    prog.CountProgInUse,
                    prog.CountProgOverall
                });
            }
            return Ok(RemovedDifferenceList);

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
            var list = _context.Program
                .Where(x => x.IsPinned == true)
                .Where(x => x.IsLicense == false)
                .Where(x => x.IsDeleted == false)
                .GroupBy(x => x.ProgramName)
                .Select(x => x.FirstOrDefault())
                .Select(x => x.ProgramName)
                .ToList();

            // Only software, not licenses. Nothing deleted. Only ones in use. Only recurring software
            var software = _context.Program
                .Where(program => program.IsLicense == false)
                .Where(program => program.IsDeleted == false)
                .Where(program => program.EmployeeId != null)
                .Where(program => program.RenewalDate != null);

            List<Models.Program> sortedPrograms = new List<Models.Program>();

            // storing the software we need in a temp value
            var savedSoftware = software;

            // rolling back all the renewal dates of the softwares so we can sort them by this date
            // this will be used to tell us which software was most recently renewed
            software
                .Where(x => x.RenewalDate != null)
                .ToList()
                .ForEach(x => x.RenewalDate = x.RenewalDate.Value.AddMonths(-(x.MonthsPerRenewal.Value)));

            // Create a list of programs that have the programs with the most recent changes first.
            var sortedProgramSoftware = software
                .Where(x => x.RenewalDate != null)
                .OrderByDescending(x => x.RenewalDate).ToList();

            // restoring software to its original state using temp
            software = savedSoftware;


            // List of distinct software
            var distinctSortedSoftware = sortedProgramSoftware
                .GroupBy(prog => prog.ProgramName)
                .Select(name => name.FirstOrDefault())
                .OrderByDescending(x => x.RenewalDate)
                .ToList();

            // All of the software names that are on the settings list.
            var distinctPinnedSoftware = software
                .Where(sw => list.Contains(sw.ProgramName))
                .GroupBy(sw => sw.ProgramName)
                .Select(name => name.FirstOrDefault());

            // list to contain the distinct pinned software names of all the distinct software
            var distinctPinnedSoftwareNames = distinctPinnedSoftware.Select(program => program.ProgramName);

            // List of distinct software
            var distinctSoftware = software
                .GroupBy(prog => prog.ProgramName)
                .Select(name => name.FirstOrDefault());

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

        }

        /* Helper method for calculating the costs of hardware in department
         * Params: List<int> : Holds the employee Ids of the employees in the current department
         * Returns: Decimal : Total cost of the hardware in the current department 
         */
        private decimal? CalculatedHardwareCost<T>(List<int> employeeIDsInDepartment)
            where T : class, IHardwareBase
        {
            // Get the table of the entity's type.
            DbSet<T> table = _context.Set<T>();

            var CostOfHardware = 0.0m;
            foreach (var hardware in table
                .Where(x => x.EmployeeId != null && x.IsAssigned == true && x.FlatCost != null))
            {
                if (employeeIDsInDepartment.Contains(hardware.EmployeeId.Value))
                {
                    //adding 30 days to the date bought and then checking if we are now past those 30 days
                    //if we are not, add cost of monitor to Cost total
                    DateTime? startDate = hardware.PurchaseDate;
                    DateTime? relevantDate = startDate.Value.AddDays(30);
                    if (DateTime.Now <= relevantDate && DateTime.Now >= hardware.PurchaseDate)
                    {
                        CostOfHardware += hardware.FlatCost.Value;
                    }
                }
            }
            return CostOfHardware;
        }

    }
}
