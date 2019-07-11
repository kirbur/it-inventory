using System;
using System.Collections.Generic;
using System.Linq;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UpdateController : ContextController
    { 
    
        public UpdateController(ITInventoryDBContext context) : base(context) { }

        /* PUT: api/udpate/department
         * Will update a specified row on the department table
         * Param input format:
                {
                    "DefaultHardware": {
                        "DefaultHardware": string[],
                    },
                    "DefaultPrograms": {
                        "license": string[],
                        "software": string[],
                    },
                    "Name": string,
                    "ID": int,
                }
         * Return: 200 if updated. Else, 400 bad request. 
         */
        [HttpPut]
        [Route("Department")]
        public IActionResult PutDepartment([FromBody] DepartmentInput input)
        {
            // Get department by ID.
            Department dep = _context.Department.Find(input.ID);

            if (dep != null)
            {
                // Try to update department row
                try
                {
                    dep.DefaultHardware = JsonConvert.SerializeObject(input.DefaultHardware);
                    dep.DefaultPrograms = JsonConvert.SerializeObject(input.DefaultPrograms);
                    dep.DepartmentName = input.Name;

                    _context.Department.Update(dep);
                    _context.SaveChanges();

                    return Ok("Updated");
                }
                catch (Exception e)
                {
                    return BadRequest(error: e.Message);
                }
            }
            else
            {
                return BadRequest("Department does not exist or failed to supply ID");
            }
        }
        /* PUT: api/udpate/programall
        * Will update all the rows of programs that have the given name
        * Param input format:
        * {     "Program" : {
        *           "OldProgramName" : String,
        *           "NewProgramName" : String,
        *           "ProgramCostPerYear" : Decimal,
        *           "ProgramFlatCost" : Decimal,
        *           "ProgramLicenseKey" : String,
        *           "IsLicense" : bool,
        *           "ProgramDescription" : String,
        *           "ProgramPurchaseLink" : String,
        *           "DateBought" : DateTime,
        *           "RenewalDate" : DateTime,
        *           "MonthsPerRenewal" : int
        *       }
        * }
        */

        [HttpPut]
        [Route("ProgramAll")]
        public IActionResult EditPrograms([FromBody] UpdateProgramInputModel input)
        {
            try
            {
                foreach (var program in _context.Program.Where(x => x.ProgramName == input.Program.OldProgramName))
                {
                    program.ProgramName = input.Program.NewProgramName;
                    program.ProgramCostPerYear = input.Program.ProgramCostPerYear;
                    program.ProgramFlatCost = input.Program.ProgramFlatCost;
                    program.ProgramLicenseKey = input.Program.ProgramLicenseKey;
                    program.IsLicense = input.Program.IsLicense;
                    program.Description = input.Program.ProgramDescription;
                    program.ProgramPurchaseLink = input.Program.ProgramPurchaseLink;
                    program.IsCostPerYear = input.Program.MonthsPerRenewal != null && input.Program.MonthsPerRenewal - 12 >= 0 ? true : false;
                    program.DateBought = input.Program.DateBought;
                    program.RenewalDate = input.Program.RenewalDate;
                    program.MonthsPerRenewal = input.Program.MonthsPerRenewal;
                }
                _context.SaveChanges();
                return StatusCode(202);
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }


        }
        /* PUT: api/udpate/program/{id}
        * Will update the program identified by the id from the route
        * Param input format:
        * {     "Program" : {
    	*            "ProgramName" : String,
    	*            "ProgramCostPerYear" : Decimal,
    	*            "ProgramFlatCost" : Decimal,
    	*            "ProgramLicenseKey" : String,
    	*            "ProgramDescription" : String,
    	*            "ProgramPurchaseLink" : String,
    	*            "DateBought" : DateTime,
		*            "RenewalDate" : DateTime,
		*            "MonthsPerRenewal" : int,
		*            "EmployeeId" : int
        *      }
        * }
        */

        [HttpPut]
        [Route("Program/{id}")]
        public IActionResult EditProgram([FromBody] PostProgramInputModel input, [FromRoute] int id)
        {
            // Get program by ID.
            var prog = _context.Program.Find(id);

            // list to hold the history entries that will be added.
            List<ProgramHistory> programHistories = new List<ProgramHistory>();

            // temp value to hold the old employee's id(could be null)
            int? progEmpId = prog.EmployeeId != null ? prog.EmployeeId : null;

            if (prog != null)
            {
                try
                {
                    prog.ProgramCostPerYear = input.Program.ProgramCostPerYear;
                    prog.ProgramFlatCost = input.Program.ProgramFlatCost;
                    prog.ProgramLicenseKey = input.Program.ProgramLicenseKey;
                    prog.Description = input.Program.ProgramDescription;
                    prog.ProgramPurchaseLink = input.Program.ProgramPurchaseLink;
                    prog.IsCostPerYear = input.Program.MonthsPerRenewal != null && input.Program.MonthsPerRenewal - 12 >= 0 ? true : false;
                    prog.DateBought = input.Program.DateBought;
                    prog.RenewalDate = input.Program.RenewalDate;
                    prog.MonthsPerRenewal = input.Program.MonthsPerRenewal;
                    prog.EmployeeId = input.Program.EmployeeId;

                    // Case 1: When an unassigned program becomes assigned
                    if (input.Program.EmployeeId != null && progEmpId == null)
                    {
                        var History = (new ProgramHistory
                        {
                            EmployeeId = input.Program.EmployeeId,
                            ProgramId = prog.ProgramId,
                            EventType = "Assigned",
                            EventDate = DateTime.Now

                        });
                        programHistories.Add(History);
                    }
                    // Case 2: When an already assigned program becomes assigned to someone else
                    // This requires 2 entries; one for the unassigning and one for the assigning.
                    else if (input.Program.EmployeeId != null && progEmpId != null)
                    {
                        // unassigning
                        var History = (new ProgramHistory
                        {
                            EmployeeId = progEmpId,
                            ProgramId = prog.ProgramId,
                            EventType = "Unassigned",
                            EventDate = DateTime.Now

                        });
                        // assigning
                        programHistories.Add(History);

                        var HistorySecond = (new ProgramHistory
                        {
                            EmployeeId = input.Program.EmployeeId,
                            ProgramId = prog.ProgramId,
                            EventType = "Assigned",
                            EventDate = DateTime.Now
                        });
                        programHistories.Add(HistorySecond);

                    }
                    // Case 3: When an assigned program becomes unassigned
                    else if (input.Program.EmployeeId == null && progEmpId != null)
                    {
                        var History = (new ProgramHistory
                        {
                            EmployeeId = progEmpId,
                            ProgramId = prog.ProgramId,
                            EventType = "Unassigned",
                            EventDate = DateTime.Now

                        });
                        programHistories.Add(History);
                    }
                    if (programHistories != null)
                    {
                        _context.ProgramHistory.AddRange(programHistories);
                    }
                    _context.SaveChanges();
                    return StatusCode(202);
                }
                catch (Exception e)
                {
                    return BadRequest(error: e.Message);
                }
            }
            else
            {
                return BadRequest("Program does not exist or failed to supply ID");
            }
        }
        /* PUT: api/udpate/employee/
         * Will update the employee identified by the given employeeId from the body
         * {
         *       "Employee": {
    	 *           "EmployeeId" : Int,
         *           "FirstName": String,
         *           "LastName": String,
         *           "HireDate": DateTime,
         *           "Role": String,
         *           "DepartmentID": int,
         *           "IsAdmin" : bool
         *       },
         *       "HardwareAssigned": [
         *            {
         *               "Type": String,
         *               "ID": int
         *           }
         *       ] for all the hardware assigned (this arraylist)
         *       "ProgramAssigned": [
         *           {
         *               "ID": int
         *           },
         *       ] for all the programs assigned (this arraylist)
         *       "HardwareUnassigned": [
         *           {
         *               "Type": String,
         *               "ID": int
         *           }
         *       ] for all the hardware unassigned (this arraylist)
         *       "ProgramUnassigned": [
         *           {
         *               "ID": int
         *           }
         *       ] for all the programs unassigned (this arraylist)
         *   }
         */

        [HttpPut]
        [Route("Employee")]
        public IActionResult EditEmployee([FromBody] EditEmployeeInputModel input)
        {
            // finding the employee from the given employeeId
            var emp = _context.Employee.Find(input.Employee.EmployeeId);

            // finding the authID connected to this employee from adGuid
            var authIdEmp = _context.AuthIdserver.Where(x => x.ActiveDirectoryId == emp.Adguid).FirstOrDefault();

            // making sure that neither of these are null. These are both created when an employee is created
            if (emp != null && authIdEmp !=null)
            {
                try
                {
                    // updating the various fields of the current employee
                    emp.HireDate = input.Employee.HireDate;
                    emp.FirstName = input.Employee.FirstName;
                    emp.LastName = input.Employee.LastName;
                    emp.Role = input.Employee.Role;
                    emp.DepartmentID = input.Employee.DepartmentID;
                    _context.Employee.Update(emp);

                    // updating the current isAdmin for the authIdServer connected to the employee
                    authIdEmp.IsAdmin = input.Employee.IsAdmin;
                    _context.AuthIdserver.Update(authIdEmp);

                    _context.SaveChanges();

                    // checking if any hardware is to be assigned
                    if (input.HardwareAssigned != null)
                    {
                        // loop through hardware and depending on what type the hardware is, then add the hardware to the specific table. 
                        // also in the loop, update the hardware history whether the it was assigned or unassigned  
                        foreach (var hardware in input.HardwareAssigned)
                        {
                            switch (hardware.Type.ToLower())
                            {
                                case "monitor":
                                    var mon = _context.Monitor.Find(hardware.ID);
                                    mon.EmployeeId = emp.EmployeeId;
                                    mon.IsAssigned = true;
                                    UpdateHardwareHistory(true, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "peripheral":
                                    var periph = _context.Peripheral.Find(hardware.ID);
                                    periph.EmployeeId = emp.EmployeeId;
                                    periph.IsAssigned = true;
                                    UpdateHardwareHistory(true, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "computer":
                                    var comp = _context.Computer.Find(hardware.ID);
                                    comp.EmployeeId = emp.EmployeeId;
                                    comp.IsAssigned = true;
                                    UpdateHardwareHistory(true, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "server":
                                    var server = _context.Server.Find(hardware.ID);
                                    server.EmployeeId = emp.EmployeeId;
                                    server.IsAssigned = true;
                                    UpdateHardwareHistory(true, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                            }
                        }
                    }
                    // checking if any hardware is to be unassigned
                    if (input.HardwareUnassigned != null)
                    {
                        foreach (var hardware in input.HardwareUnassigned)
                        {
                            switch (hardware.Type.ToLower())
                            {
                                case "monitor":
                                    var mon = _context.Monitor.Find(hardware.ID);
                                    mon.EmployeeId = null;
                                    mon.IsAssigned = false;
                                    UpdateHardwareHistory(false, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "peripheral":
                                    var periph = _context.Peripheral.Find(hardware.ID);
                                    periph.EmployeeId = null;
                                    periph.IsAssigned = false;
                                    UpdateHardwareHistory(false, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "computer":
                                    var comp = _context.Computer.Find(hardware.ID);
                                    comp.EmployeeId = null;
                                    comp.IsAssigned = false;
                                    UpdateHardwareHistory(false, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                                case "server":
                                    var server = _context.Server.Find(hardware.ID);
                                    server.EmployeeId = null;
                                    server.IsAssigned = false;
                                    UpdateHardwareHistory(false, emp.EmployeeId, hardware.ID, hardware.Type);
                                    _context.SaveChanges();
                                    break;
                            }
                        }
                    }

                    // list to hold the histories of programs that will be added
                    List<ProgramHistory> programHistories = new List<ProgramHistory>();

                    // checking if any programs are to be assigned
                    if (input.ProgramAssigned != null)
                    {
                        foreach (var program in input.ProgramAssigned)
                        {
                            var prog = _context.Program.Find(program.ID);
                            prog.EmployeeId = input.Employee.EmployeeId;
                            programHistories.Add(UpdateProgramHistory(true, emp.EmployeeId, program.ID));
                        }
                    }

                    // checking if any programs are to be unassigned
                    if (input.ProgramUnassigned != null)
                    {
                        foreach (var program in input.ProgramUnassigned)
                        {
                            var prog = _context.Program.Find(program.ID);
                            prog.EmployeeId = null;
                            programHistories.Add(UpdateProgramHistory(false, emp.EmployeeId, program.ID));
                        }
                        // Save multiple entries at once

                    }
                    if (programHistories != null)
                    {
                        _context.ProgramHistory.AddRange(programHistories);
                    }
                    _context.SaveChanges();

                    return StatusCode(202);
                }

                catch (Exception e)
                {
                    return BadRequest(error: e.Message);
                }
            }
            else
            {
                return BadRequest("Employee does not exist");
            }
        }

    }
}
