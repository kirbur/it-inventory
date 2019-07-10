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
    public class UpdateController : ControllerBase
    {
        private readonly ITInventoryDBContext _context;

        public UpdateController(ITInventoryDBContext context)
        {
            _context = context;
        }

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
            var dep = _context.Department.Find(input.ID);

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

    }
}
