using System;
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
    }
}