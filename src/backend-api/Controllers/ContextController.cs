using System;
using System.Linq;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api")]
    [ApiController]
    public class ContextController : ControllerBase
    {
        public readonly ITInventoryDBContext _context;

        public ContextController(ITInventoryDBContext context)
        {
            _context = context;
        }

        // TODO: Abstract this reused code from this and the image controller.
        /* Change the front end to match the back end verbatim. 
         * Return: "computer" if "laptop" is matched.
         * Else: return the same string.
         */
        public string VerbatimMatch(string routeModel)
        {
            return routeModel.ToLower() == "laptop" ? "computer" : routeModel.ToLower();
        }

        public void UpdateHardwareHistory(bool isAssigned, int employeeId, int hardwareId, string type)
        {
            // Update the history: Assigned or Unassigned
            _context.HardwareHistory.Add(new HardwareHistory
            {
                HardwareId = hardwareId,
                EmployeeId = employeeId,
                HardwareType = type,
                EventType = $"{(isAssigned ? "Assigned" : "Unassigned")}",
                EventDate = DateTime.Now,
            });
        }

        public ProgramHistory UpdateProgramHistory(bool isAssigned, int employeeId, int programId)
        {
            // Update the history: Assigned or Unassigned
            return (new ProgramHistory
            {
                ProgramId = programId,
                EmployeeId = employeeId,
                EventType = $"{(isAssigned ? "Assigned" : "Unassigned")}",
                EventDate = DateTime.Now,
            });
        }

    }
}