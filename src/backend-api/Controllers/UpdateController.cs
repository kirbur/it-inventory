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
        /* PUT: api/update/program/{id}
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
                    _context.ProgramHistory.AddRange(programHistories);

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
		            "Location" : "xx"? (either GR or AA),
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
		            "Location" : "xx"? (either GR or AA),
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
		            "Location" : "xx"? (either GR or AA),
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
		            "Location" : "xx"? (either GR or AA),
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

                // Get the table of the entity's type.
                DbSet<T> table = _context.Set<T>();

                // Get the old hardware entity from the db.
                T oldHardware = table.Find(hardwareId);

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
                        // Assign
                        UpdateHardwareHistory(newEmployeeId, type, hardwareId, "Assigned", DateTime.Now);
                    }

                    // Case 2: Assigned --> Reassigned
                    else if (oldEmployeeId != null && newEmployeeId != null && oldEmployeeId != newEmployeeId)
                    {
                        // Unassign
                        UpdateHardwareHistory(oldEmployeeId, type, hardwareId, "Unassigned", DateTime.Now);

                        // Then Assign
                        UpdateHardwareHistory(newEmployeeId, type, hardwareId, "Assigned", DateTime.Now);
                    }

                    // Case 3: Assigned --> Un
                    else if (oldEmployeeId != null && newEmployeeId == null)
                    {
                        // Unassign
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
