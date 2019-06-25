using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
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

        private IActionResult GetEmployeeDetail(int id)
        {
            var emp = _context.Employee.Find(id);

            if (emp == null)
            {
                return NotFound();
            }

            // Make sure the thing is not deleted.
            decimal totalHardwareCost = 0.0m;
            List<object> hardware = new List<object>();
            foreach (Server sv in _context.Server.Where(server => server.EmployeeId == id && server.IsDeleted == false))
            {
                // TODO: add serial number? 
                // TODO: add tool tip data.
                object server = new { id = sv.ServerId, type = nameof(Server), sv.Make, sv.Model, sv.Mfg, sv.PurchaseDate };
                hardware.Add(server);
                totalHardwareCost += sv.FlatCost ?? 0.0m;
            }
            foreach (Computer cp in _context.Computer.Where(computer => computer.EmployeeId == id && computer.IsDeleted == false))
            {
                object computer = new { id = cp.ComputerId, type = nameof(Computer), cp.Make, cp.Model, cp.Mfg, cp.PurchaseDate };
                hardware.Add(computer);
                totalHardwareCost += cp.FlatCost ?? 0.0m;
            }
            foreach (Monitor mn in _context.Monitor.Where(monitor => monitor.EmployeeId == id && monitor.IsDeleted == false))
            {
                object monitor = new { id = mn.MonitorId, type = nameof(Monitor), mn.Make, mn.Model, mn.Mfg, mn.PurchaseDate };
                hardware.Add(monitor);
                totalHardwareCost += mn.FlatCost ?? 0.0m;
            }
            foreach (Peripheral pr in _context.Peripheral.Where(peripheral => peripheral.EmployeeId == id && peripheral.IsDeleted == false))
            {
                // TODO: Peripheral does not have make and model, but instead has name and type.
                object peripheral = new { id = pr.PeripheralId, type = nameof(Peripheral), make = pr.PeripheralName, model = pr.PeripheralType, pr.Mfg, pr.PurchaseDate };
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
                    object license = new { prog.ProgramId, prog.ProgramName, prog.ProgramLicenseKey };
                    licenses.Add(license);
                }
                else
                {
                    // TODO: How to check if a person is an admin? If so, then display the key.
                    object sw = new { prog.ProgramId, prog.ProgramName, prog.ProgramLicenseKey, costPerMonth };
                    software.Add(sw);
                }
            }

            string picture = $"/images/employee/{id}";

            //// Combine the hardware into one list for the single table.
            //List<object> hardware = (from x in servers select (Object)x).ToList();
            //hardware.AddRange((from x in laptops select (Object)x).ToList());
            //hardware.AddRange((from x in monitors select (Object)x).ToList());
            //hardware.AddRange((from x in monitors select (Object)x).ToList());

            // Get the department name
            var department = _context.Department.Where(dep => dep.DepartmentId == emp.DepartmentId && !dep.IsDeleted).FirstOrDefault().DepartmentName;

            object employeeDetail = new { picture, totalProgramCostPerMonth, totalHardwareCost, emp.FirstName, emp.LastName, emp.Role, department, hardware, licenses, software, };
            return Ok(employeeDetail);
        }

    }
}
