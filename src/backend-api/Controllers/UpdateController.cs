using System;
using System.Collections.Generic;
using System.Linq;
using backend_api.Helpers;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace backend_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UpdateController : ContextController
    {
        public UpdateController(ITInventoryDBContext context) : base(context) { }

        /* PUT: api/update/department
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

        /* PUT: api/udpate/programPins
        * Will update all the rows of programs to only pin the given programs and unpin everything else
        *  Param input format:[
        *  "ProgramName",
        *  ]
        */
        [HttpPut]
        [Route("ProgramPins")]
        public IActionResult EditProgramsPins([FromBody] string[] input)
        {
            // This line loops through every program and updates its IsPinned field depending on whether
            // the program is in the given input
            _context.Program
                .ToList()
                .ForEach(prog => prog.IsPinned = input.Contains(prog.ProgramName) ? true : false);
            _context.SaveChanges();
            return Ok();
        }

        /* PUT: api/udpate/programall
        * Will update all the rows of programs that have the given name
        * Param input format:
        * {     "Program" : {
        *           "OldProgramName" : String,
        *           "ProgramName" : String,
        *           "ProgramCostPerYear" : Decimal,
        *           "ProgramFlatCost" : Decimal,
        *           "ProgramLicenseKey" : String,
        *           "IsLicense" : bool,
        *           "Description" : String,
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
            var updatedProg = input.Program;
            try
            {
                _context.Program
                    // Find where the program name matches.
                    .Where(x => x.ProgramName == updatedProg.OldProgramName)
                    .ToList()
                    .ForEach(program =>
                    {
                        // Update Program properties.
                        PropertyUtil<Models.Program, ProgramUpdateObjectModel>.UpdateProperties(program, updatedProg);
                        program.IsCostPerYear = updatedProg.MonthsPerRenewal != null && updatedProg.MonthsPerRenewal - 12 >= 0
                            ? true : false;
                    }
                );
                _context.SaveChanges();
                return StatusCode(202);
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* PUT: api/update/program/{id}
        * Will update the program identified by the id from the route
        * Param input format:
        * {     "Program" : {
    	*            "ProgramName" : String,
    	*            "ProgramCostPerYear" : Decimal,
    	*            "ProgramFlatCost" : Decimal,
    	*            "ProgramLicenseKey" : String,
    	*            "Description" : String,
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

            // if the program does not exist then return error message
            if (prog == null)
            {
                return BadRequest($"No such program exists with id: {id}");
            }

            // list to hold the history entries that will be added.
            List<ProgramHistory> programHistories = new List<ProgramHistory>();

            // temp value to hold the old employee's id(could be null)
            int? progEmpId = prog.EmployeeId;

            // Updated program
            ProgramObjectModel updatedProg = input.Program;

            if (prog != null)
            {
                try
                {
                    // Update the properties of the program.

                    // storing IsLicense in temp value
                    bool IsLicenseTemp = prog.IsLicense;
                    PropertyUtil<Models.Program, ProgramObjectModel>.UpdateProperties(prog, updatedProg);
                    prog.IsCostPerYear = input.Program.MonthsPerRenewal != null && input.Program.MonthsPerRenewal - 12 >= 0 ? true : false;
                    // reseting license back to its original value using temp
                    prog.IsLicense = IsLicenseTemp;
                    // Case 1: When an unassigned program becomes assigned
                    if (input.Program.EmployeeId != null && progEmpId == null)
                    {
                        var History = UpdateProgramHistory(prog.ProgramId, input.Program.EmployeeId, "Assigned", DateTime.Now);
                        programHistories.Add(History);
                    }
                    // Case 2: When an already assigned program becomes assigned to someone else
                    // This requires 2 entries; one for the unassigning and one for the assigning.
                    else if (input.Program.EmployeeId != null && progEmpId != null && input.Program.EmployeeId != progEmpId)
                    {
                        // unassigning
                        var History = UpdateProgramHistory(prog.ProgramId, progEmpId, "Unassigned", DateTime.Now);

                        programHistories.Add(History);

                        // assigning
                        var HistorySecond = UpdateProgramHistory(prog.ProgramId, input.Program.EmployeeId, "Assigned", DateTime.Now);
                        programHistories.Add(HistorySecond);

                    }
                    // Case 3: When an assigned program becomes unassigned
                    else if (input.Program.EmployeeId == null && progEmpId != null)
                    {
                        var History = UpdateProgramHistory(prog.ProgramId, progEmpId, "Unassigned", DateTime.Now);
                        programHistories.Add(History);
                        prog.EmployeeId = null;
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

        /* PUT: api/update/Plugin
         * Takes in as input:
         * {
         *     "PluginId" : int, 
	     *     "ProgramName" : string,
	     *     "PluginName" : string,
	     *     "PluginFlatCost" : decimal,
	     *     "TextField" : string,
	     *     "PluginCostPerYear" : decimal,
	     *     "RenewalDate" : DateTime,
	     *     "MonthsPerRenewal" : int,
         *     "DateBought" : DateTime
         * }
         */
        [HttpPut]
        [Route("Plugin")]
        public IActionResult PostPlugin([FromBody] EditPluginInputModel input)
        {
            // finding the plugin by the given id
            var plugin = _context.Plugins.Find(input.PluginId);

            // if the plugin does not exist then return error message
            if (plugin == null)
            {
                return BadRequest("No such plug-in exists");
            }
            // if the Program that is connected to this plugin does not exist then return error message
            if (!(_context.Program.Select(x => x.ProgramName).ToList().Contains(input.ProgramName)))
            {
                return BadRequest("No such program exists");
            }
            try
            {
                var updatedPlugin = input;

                // Update plugin fields.
                PropertyUtil<Plugins, EditPluginInputModel>.UpdateProperties(plugin, updatedPlugin);
                plugin.ProgramId = _context.Program.Where(x => x.ProgramName == input.ProgramName).Select(x => x.ProgramId).First();
                plugin.IsCostPerYear = input.MonthsPerRenewal != null && input.MonthsPerRenewal - 12 >= 0 ? true : false;
                plugin.IsDeleted = false;

                _context.Update(plugin);
                _context.SaveChanges();
                return StatusCode(202);
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* PUT: api/update/employee/
         * Will update the employee identified by the given employeeId from the body
         * {
         *       "Employee": {
    	 *           "EmployeeId" : Int,
         *           "FirstName": String,
         *           "LastName": String,
         *           "HireDate": DateTime,
         *           "Role": String,
         *           "DepartmentID": int,
         *           "IsAdmin" : bool,
         *           "TextField" : string
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
            if (emp != null && authIdEmp != null)
            {
                try
                {
                    EditEmployeeObjectModel updatedEmp = input.Employee;

                    // updating the various fields of the current employee
                    PropertyUtil<Employee, EditEmployeeObjectModel>.UpdateProperties(emp, updatedEmp);
                    _context.Employee.Update(emp);

                    // updating the current isAdmin for the authIdServer connected to the employee
                    authIdEmp.IsAdmin = updatedEmp.IsAdmin;
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
                                    UpdateHardwareAssignment(_context.Monitor, emp.EmployeeId, true, hardware);
                                    break;
                                case "peripheral":
                                    UpdateHardwareAssignment(_context.Peripheral, emp.EmployeeId, true, hardware);
                                    break;
                                case "computer":
                                    UpdateHardwareAssignment(_context.Computer, emp.EmployeeId, true, hardware);
                                    break;
                                case "server":
                                    UpdateHardwareAssignment(_context.Server, emp.EmployeeId, true, hardware);
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
                                    UpdateHardwareAssignment(_context.Monitor, emp.EmployeeId, false, hardware);
                                    break;
                                case "peripheral":
                                    UpdateHardwareAssignment(_context.Peripheral, emp.EmployeeId, false, hardware);
                                    break;
                                case "computer":
                                    UpdateHardwareAssignment(_context.Computer, emp.EmployeeId, false, hardware);
                                    break;
                                case "server":
                                    UpdateHardwareAssignment(_context.Server, emp.EmployeeId, false, hardware);
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
                            programHistories.Add(UpdateProgramHistory(program.ID, emp.EmployeeId, "Assigned", DateTime.Now));
                        }
                    }

                    // checking if any programs are to be unassigned
                    if (input.ProgramUnassigned != null)
                    {
                        foreach (var program in input.ProgramUnassigned)
                        {
                            var prog = _context.Program.Find(program.ID);
                            prog.EmployeeId = null;
                            programHistories.Add(UpdateProgramHistory(program.ID, emp.EmployeeId, "Unassigned", DateTime.Now));
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


        /* PUT: api/update/server
         * Input param format:
             { 
               "Entity": {
                    "ServerId" : int,
                    "Fqdn" : string?,
		            "NumberOfCores" : int?,
		            "OperatingSystem" : string?,
		            "Ram" : int?,
		            "Virtualize" : bool,
		            "RenewalDate" : string? (formatted yyyy-mm-dd),
		            "EmployeeId" : int?,
		            "PurchaseDate" : string? (formatted yyyy-mm-dd),
		            "FlatCost" : decimal?,
		            "EndOfLife" : string? (formatted yyyy-mm-dd),
		            "TextField" : string?,
		            "CostPerYear" : decimal?,
		            "MFG" : string?,
		            "Make" : string?,
		            "Model" : string?,
		            "IPAddress" : string?,
		            "SAN" : string?,
		            "LocalHHD" : string?,
		            "Location" : "string"?,
		            "SerialNumber" : string?,
		            "MonthsPerRenewal" : int?,
                },
                "AddHistory": [ {
                    "EventType": string,
                    "EventDate": string formatted as "yyyy-mm-dd hr:mn:sc.000",
                    } ,.. ],
                "DeleteHistory": int[], 
              } 
         * PutHardware<T>(input) will update the entity specified and will automatically generate
         *   assignment history. The method will also add history provided from the PUT request and 
         *   delete rows specified in the request.
         * Return: 200 if updates were successful, and 400 if they were not successful. 
         */
        [HttpPut]
        [Route("server")]
        public IActionResult PutServer([FromBody] HistoryEntityInput<Server> input)
        {
            return PutHardware(input);
        }

        /* PUT: api/update/monitor
             { 
               "Entity": {
                    "MonitorId" : int,
		            "Make" : string?,
		            "Model" : string?,
		            "Resolution" : integer?,
		            "Inputs" : string?,
		            "EmployeeId" : int?,
		            "TextField" : string?,
		            "PurchaseDate" : string? (formatted yyyy-mm-dd),
		            "FlatCost" : decimal?,
		            "CostPerYear" : decimal?,
		            "ScreenSize" : float?,
		            "Mfg" : string?,
		            "RenewalDate" : string? (formatted yyyy-mm-dd),
		            "Location" : "string"?,
		            "SerialNumber" : string?,
		            "MonthsPerRenewal" : int?,
                },
                "AddHistory": [ {
                    "EventType": string,
                    "EventDate": string formatted as "yyyy-mm-dd hr:mn:sc.000",
                    } ,.. ],
                "DeleteHistory": int[], 
              } 
         * PutHardware<T>(input) will update the entity specified and will automatically generate
         *   assignment history. The method will also add history provided from the PUT request and 
         *   delete rows specified in the request.
         * Return: 200 if updates were successful, and 400 if they were not successful. 
         */
        [HttpPut]
        [Route("monitor")]
        public IActionResult PutMonitor([FromBody] HistoryEntityInput<Monitor> input)
        {
            return PutHardware(input);
        }

        /* PUT: api/update/computer
             { 
               "Entity": {
                    "ComputerId" : int,
		            "Cpu" : string?,
		            "Ramgb" : int?,
		            "Ssdgb" : int?,
		            "PurchaseDate" : string? (formatted yyyy-mm-dd),
		            "RenewalDate" : string? (formatted yyyy-mm-dd),
		            "FlatCost" : decimal?,
		            "MonitorOutput" : string?,
		            "EndOfLife" : string? (formatted yyyy-mm-dd),
		            "EmployeeId" : int?,
		            "TextField" : string?,
		            "ScreenSize" : float?,
		            "CostPerYear" : decimal?,
		            "Resolution" : decimal?,
		            "Mfg" : string?,
		            "Make" : string?,
		            "Model" : string?,
		            "Fqdn" : string?,
		            "Location" : "string"?,
		            "SerialNumber" : string?,
		            "MonthsPerRenewal" : int?
                },
                "AddHistory": [ {
                    "EventType": string,
                    "EventDate": string formatted as "yyyy-mm-dd hr:mn:sc.000",
                    } ,.. ],
                "DeleteHistory": int[], 
              } 
         * PutHardware<T>(input) will update the entity specified and will automatically generate
         *   assignment history. The method will also add history provided from the PUT request and 
         *   delete rows specified in the request.
         * Return: 200 if updates were successful, and 400 if they were not successful. 
         */
        [HttpPut]
        [Route("laptop")]
        [Route("computer")]
        public IActionResult PutComputer([FromBody] HistoryEntityInput<Computer> input)
        {
            return PutHardware(input);
        }

        /* PUT: api/update/peripheral
             { 
               "Entity": {
                    "PeripheralId" : int,
		            "PeripheralName" : string?,
		            "PeripheralType" : string?,
		            "TextField" : string?,
		            "EmployeeId" : int?,
		            "FlatCost" : decimal?,
		            "PurchaseDate" : string? (formatted yyyy-mm-dd),,
		            "CostPerYear" : decimal?,
		            "Mfg" : string?,
		            "Location" : "string"?,
		            "RenewalDate" : string? (formatted yyyy-mm-dd),
		            "SerialNumber" : string?,
		            "MonthsPerRenewal" : int?,
                },
                "AddHistory": [ {
                    "EventType": string,
                    "EventDate": string formatted as "yyyy-mm-dd hr:mn:sc.000",
                    } ,.. ],
                "DeleteHistory": int[], 
              } 
         * PutHardware<T>(input) will update the entity specified and will automatically generate
         *   assignment history. The method will also add history provided from the PUT request and 
         *   delete rows specified in the request.
         * Return: 200 if updates were successful, and 400 if they were not successful. 
         */
        [HttpPut]
        [Route("peripheral")]
        public IActionResult PutPeripheral([FromBody] HistoryEntityInput<Peripheral> input)
        {
            return PutHardware(input);
        }

        /* PUT: api/update/{hardware}
         * Input param format:
             { 
               "Entity": {
                    specific fields for hardware type.
                },
                "AddHistory": [ {
                        "EventType": string,
                        "EventDate": string formatted as "yyyy-mm-dd hr:mn:sc.000",
                    } ,.. ],
                "DeleteHistory": int[], 
              } 
         * PutHardware<T>(input) will update the entity specified and will automatically generate
         *   assignment history. The method will also add history provided from the PUT request and 
         *   delete rows specified in the request.
         * Return: 200 if updates were successful, and 400 if they were not successful. 
         */
        private IActionResult PutHardware<T>(HistoryEntityInput<T> input)
            where T : class, IHardwareBase
        {
            T newHardware = input.Entity;
            int hardwareId = newHardware.GetId();

            // Check to make sure an Id was given in the request body.
            if (hardwareId == 0)
            {
                return BadRequest("Id not supplied in body");
            }
            else
            {
                string type = GetClassName(newHardware);

                // Get the old hardware entity from the db.
                T oldHardware = _context.Set<T>().Find(hardwareId);

                // Make sure the id is valid for the type requested.
                if (oldHardware == null)
                {
                    return BadRequest($"Cannot find {type} with id {hardwareId}.");
                }
                else
                {
                    // Make the old hardware be detached from the DB
                    _context.Entry(oldHardware).State = EntityState.Detached;

                    // Make this entity be tracked by the DB.
                    _context.Entry(newHardware).State = EntityState.Modified;

                    int? newEmployeeId = newHardware.EmployeeId;
                    int? oldEmployeeId = oldHardware.EmployeeId;

                    // Update values not sent by the request body.
                    newHardware.IsAssigned = newEmployeeId != null ? true : false;
                    newHardware.IsDeleted = oldHardware.IsDeleted;

                    // Update history on assignment change.
                    // Case 1: Un --> Assigned
                    if (oldEmployeeId == null && newEmployeeId != null)
                    {
                        UpdateHardwareHistory(newEmployeeId, type, hardwareId, "Assigned", DateTime.Now);
                    }

                    // Case 2: Assigned --> Reassigned
                    else if (oldEmployeeId != null && newEmployeeId != null && oldEmployeeId != newEmployeeId)
                    {
                        UpdateHardwareHistory(oldEmployeeId, type, hardwareId, "Unassigned", DateTime.Now);

                        UpdateHardwareHistory(newEmployeeId, type, hardwareId, "Assigned", DateTime.Now);
                    }

                    // Case 3: Assigned --> Un
                    else if (oldEmployeeId != null && newEmployeeId == null)
                    {
                        UpdateHardwareHistory(oldEmployeeId, type, hardwareId, "Unassigned", DateTime.Now);
                    }

                    // Create history specified in PUT request.
                    // NOTE: The user added history will be put under whatever the new employeeId is.
                    var addHistory = input.AddHistory;
                    if (addHistory != null)
                    {
                        foreach (var historyEvent in addHistory)
                        {
                            UpdateHardwareHistory(newEmployeeId, type, hardwareId, historyEvent.EventType, historyEvent.EventDate);
                        }
                    }

                    // Delete history rows user wanted to be deleted
                    int[] deleteHistory = input.DeleteHistory;
                    if (deleteHistory != null)
                    {
                        foreach (int historyEventId in deleteHistory)
                        {
                            HardwareHistory historyEvent = _context.HardwareHistory.Find(historyEventId);
                            if (historyEvent != null)
                            {
                                _context.Remove(historyEvent);
                            }
                        }
                    }

                    // Update and save.
                    _context.Update(newHardware);
                    _context.SaveChanges();
                    return Ok($"{type} and history updated.");
                }

            }
        }

    }
}
