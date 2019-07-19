using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Models;
using backend_api.Helpers;
using System.Collections.Generic;

namespace backend_api.Controllers
{
    // [Authorize]
    [ApiController]
    public class ArchiveRecoverController : ContextController
    {
        // Makes sure the operation is either "archive" or "recover"
        public enum ValidOperation
        {
            Archive,
            Recover,
        }
        public ArchiveRecoverController(ITInventoryDBContext context) : base(context) { }

        /* PUT: api/{operation}/{model}/{id}
         * Route Params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {model} is a string that is a name of one of the models.
         *        Employee, Department, Program, Plugin, Server, Laptop, Monitor, Peripheral
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverSwitch(operation, model, id) is the generic controller for all archiving/recovering
         *   of the models. The method will validate the model and operation and then call the appropriate
         *   methods and will change the IsDeleted field for the id of the model corresponding to the operation.
         * Method Params are from the route which are specified above.
         * Return: IActionResult 200 if updated. Else, 400 bad request. 
         */
        [HttpPut]
        [Route("{operation}/{model}/{id}")]
        public IActionResult ArchiveRecoverSwitch([FromRoute] ValidOperation operation, string model, int id)
        {
            // Make the model all lower and change "laptop" to "computer".
            model = VerbatimMatch(model);

            // Assigns isDeleted to a boolean according to the operation provided.
            bool isDeleted = ValidOperation.Archive == operation ? true : false;

            switch (model)
            {
                case "employee":
                    return ArchiveRecoverEmployee(isDeleted, id);
                case "program":
                    return ArchiveRecoverProgram(isDeleted, id);
                case "plugin":
                    return ArchiveRecoverPlugin(isDeleted, id);
                case "department":
                    return ArchiveRecoverDepartment(isDeleted, id);
                case "server":
                    return ArchiveRecoverHardware(_context.Server, isDeleted, id);
                case "computer":
                    return ArchiveRecoverHardware(_context.Computer, isDeleted, id);
                case "monitor":
                    return ArchiveRecoverHardware(_context.Monitor, isDeleted, id);
                case "peripheral":
                    return ArchiveRecoverHardware(_context.Peripheral, isDeleted, id);
                default:
                    return BadRequest("Invalid Model");
            }
        }

        /* PUT: api/{operation}/employee/{id}
         * Route params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverEmployee(isDeleted, id) is a employee method for archiving and recovering 
         *   a employee. The method will change the IsDeleted field for the employee of the id corresponding
         *   to the operation.
         * Method Params:
         *   bool isDeleted, is if the employee is going to be archived or recovered
         *   int id, the ID of the specified employee
         * 
         */
        private IActionResult ArchiveRecoverEmployee(bool isDeleted, int id)
        {

            // Get Employee by ID.
            Employee emp = _context.Employee.Find(id);

            if (emp != null)
            {
                return TryUpdateEmployee(isDeleted, emp);
            }
            else
            {
                return BadRequest("Employee does not exist or failed to supply ID");
            }
        }


        /* TryUpdateEmployee(isDeleted, emp) will try to update the IsDeleted field on the 
         *   employee row.
         */
        private IActionResult TryUpdateEmployee(bool isDeleted, Employee emp)
        {
            // setting the isDeleted of the employee from the inputed bool.
            emp.IsDeleted = isDeleted;

            // list of program histories which will store the program histories so we can add them simultaneously
            List<ProgramHistory> ProgramHistories = new List<ProgramHistory>();

            // if the employee given is to be archived
            if (isDeleted)
            {
                // find the programs that belong to this employee and unassign them and update the program history accordingly
                // using the helper method
                foreach (var prog in _context.Program.Where(x => x.EmployeeId == emp.EmployeeId))
                {
                    // set the employee assigned to this current program to null
                    prog.EmployeeId = null;
                    // call helper method that creates a history entry with our given inputs. An entry is returned and
                    // we append this entry to our list.
                    var history = UpdateProgramHistory(prog.ProgramId, emp.EmployeeId, "Unassigned", DateTime.Now);
                    _context.Program.Update(prog);
                    ProgramHistories.Add(history);
                }

                // add all the program histories simultaneously
                _context.ProgramHistory.AddRange(ProgramHistories);

                // search all the 4 hardware types and unassign if necessary and if hardware is unassigned,
                // update the history entries 
                UpdateHardwareAssigning<Monitor>(emp.EmployeeId);
                UpdateHardwareAssigning<Server>(emp.EmployeeId);
                UpdateHardwareAssigning<Computer>(emp.EmployeeId);
                UpdateHardwareAssigning<Peripheral>(emp.EmployeeId);
            }

            _context.SaveChanges();

            return Ok($"{(isDeleted ? "archive" : "recover")} completed");

        }

        /* PUT: api/{operation}/program/{id}
         * Route params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverProgram(isDeleted, id) is a program method for archiving and recovering 
         *   a program. The method will change the IsDeleted field for the program of the id corresponding
         *   to the operation.
         * Method Params:
         *   bool isDeleted, is if the program is going to be archived or recovered
         *   int id, the ID of the specified program
         * 
         */
        private IActionResult ArchiveRecoverProgram(bool isDeleted, int id)
        {

            // Get program by ID.
            Models.Program prog = _context.Program.Find(id);

            if (prog != null)
            {
                return TryUpdateProgram(isDeleted, prog);
            }
            else
            {
                return BadRequest("Program does not exist or failed to supply ID");
            }
        }


        /* TryUpdateProgram(isDeleted, prog) will try to update the IsDeleted field on the 
         *   program row.
         */
        private IActionResult TryUpdateProgram(bool isDeleted, Models.Program prog)
        {
            prog.IsDeleted = isDeleted;

            if (isDeleted)
            {
                prog.EmployeeId = null;
            }
            _context.Program.Update(prog);
            _context.SaveChanges();

            return Ok($"{(isDeleted ? "archive" : "recover")} completed");

        }


        /* PUT: api/{operation}/department/{id}
         * Route params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverDepartment(isDeleted, id) is a department method for archiving and recovering 
         *   a department. The method will change the IsDeleted field for the Department of the id corresponding
         *   to the operation. And will not archive the Department if employees are still assigned to the Department.
         * Method Params:
         *   bool isDeleted, is if the department is going to be archived or recovered
         *   int id, the ID of the specified department
         * Return: IActionResult 200 if updated. Else, 400 bad request. 
         */
        private IActionResult ArchiveRecoverDepartment(bool isDeleted, int id)
        {
            // Find if any employees are still assigned to the department.
            int count = _context.Employee.Where(emp => emp.DepartmentID == id).ToList().Count();

            // Cannot archive if there are still employees assigned to the department.
            if (count > 0 && isDeleted)
            {
                return BadRequest($"Cannot archive department. {count} employee{(count > 1 ? "s" : "")} assigned to department");
            }
            else
            {
                // Get department by ID.
                Department dep = _context.Department.Find(id);

                if (dep != null)
                {
                    return TryUpdateDepartment(isDeleted, dep);
                }
                else
                {
                    return BadRequest("Department does not exist or failed to supply ID");
                }
            }
        }

        /* TryUpdateDepartment(isDeleted, dep) will try to update the IsDeleted field on the 
         *   department row.
         * Result IActionResult. 200 if successful. 400 if not.
         */
        private IActionResult TryUpdateDepartment(bool isDeleted, Department dep)
        {
            try
            {
                dep.IsDeleted = isDeleted;
                _context.Department.Update(dep);
                _context.SaveChanges();

                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* PUT: api/{operation}/plugin/{id}
         * Route params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverPlugin(isDeleted, id) is a plugin method for archiving and recovering 
         *   a plugin. The method will change the IsDeleted field for the plugin of the id corresponding
         *   to the operation.
         * Method Params:
         *   bool isDeleted, is if the plugin is going to be archived or recovered
         *   int id, the ID of the specified department
         * Return: IActionResult 200 if updated. Else, 400 bad request. 
         */
        private IActionResult ArchiveRecoverPlugin(bool isDeleted, int id)
        {
            // find plugin by ID
            var plugin = _context.Plugins.Find(id);
            if (plugin != null)
            {
                try
                {
                    return TryUpdatePlugin(isDeleted, plugin);
                }
                catch
                {
                    return BadRequest("Plugin does not exist or failed to supply ID");
                }

            }
            return BadRequest("Plugin does not exist or failed to supply ID");
        }

        /* TryUpdatePlugin(isDeleted, dep) will try to update the IsDeleted field on the 
         *   plugin row.
         * Result IActionResult. 200 if successful. 400 if not.
         */
        private IActionResult TryUpdatePlugin(bool isDeleted, Plugins plugin)
        {
            try
            {
                plugin.IsDeleted = isDeleted;
                _context.Plugins.Update(plugin);
                _context.SaveChanges();

                // find the specific program tied to this plugin that was just updated
                var programTiedToPlugin = _context.Program.Find(plugin.ProgramId);

                // if we just deleted this plugin...
                if (isDeleted == true)
                {
                    // if that plugin deleted was the last plugin attached to that program...
                    var wasLastPlugin = !(_context.Plugins.Any(x => x.ProgramId == plugin.ProgramId && x.IsDeleted == false));
                    if (wasLastPlugin == true)
                    {
                        // update the has plugin field so that its programs no longer have a plugin
                        _context.Program.Where(x => x.ProgramName == programTiedToPlugin.ProgramName).ToList().ForEach(x => x.HasPlugIn = false);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    // if the plug-in recovered is the first plugin for the connected programs
                    var wasFirstPlugin = _context.Plugins.Where(x => x.ProgramId == plugin.ProgramId && x.IsDeleted == false).Count() == 1;
                    if (wasFirstPlugin == true)
                    {
                        // update the has plugin field so that its programs now have a plugin
                        _context.Program.Where(x => x.ProgramName == programTiedToPlugin.ProgramName).ToList().ForEach(x => x.HasPlugIn = true);
                        _context.SaveChanges();
                    }
                }



                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* PUT: api/{operation}/{model}/{id}
         * Route Params:
         *   {operation} is a string. Either "archive" or "recover"
         *   {model} is a string that is a name of one of the Hardware models.
         *       Server, Laptop, Monitor, Peripheral
         *   {id} is a number that is the ID for any of the models.
         * ArchiveRecoverhardware<T>(dbSet, isDeleted, id) is a generic method for archive/recovering
         *   and assigning hardware entities.
         *   The method will also:
         *    - change the IsDeleted field for the Hardware of the id corresponding to the operation.
         *    - add an entry to the Hardware History for the Hardware.
         *    - change laptop to match the back-end verbatim of "computer"
         * Method Params:
         *   DbSet<T> dbSet is the _context.<HardwareType> for the entity
         *   bool isDeleted, true if the entity is going to be archived
         *   int id, is the entity id on the table.
         * Return: IActionResult 200 if updated. Else, 400 bad request. 
         */
        private IActionResult ArchiveRecoverHardware<T>(DbSet<T> dbSet, bool isDeleted, int id)
            where T : class, IHardwareBase
        {
            // Find hardware entity by ID.
            var hardware = dbSet.Find(id);

            // Gets the name of the type T in DbSet<T> at runtime
            string type = dbSet.GetType().GetGenericArguments()
                .Single().Name;

            // Make sure hardware is not null
            if (hardware != null)
            {
                return CheckEntityDeletedState(hardware, isDeleted, id, type);
            }
            else
            {
                return BadRequest($"{type} does not exist or failed to supply ID");
            }
        }

        /* CheckEntityDeletedState<T>(hardware, isDeleted, id, type) will check the current IsDeleted state
         *   of the hardware with the database IsDeleted state. 
         * Return IActionResult 400 if the IsDeleted states are the same.
         */
        private IActionResult CheckEntityDeletedState<T>(T hardware, bool isDeleted, int id, string type)
            where T : class, IHardwareBase
        {
            if (hardware.IsDeleted == isDeleted)
            {
                return BadRequest($"{type} cannot be {(isDeleted ? "archived if already archived" : "recovered if already recovered")}");
            }
            else
            {
                return TryUpdatingHardware(hardware, isDeleted, id, type);
            }
        }

        /* TryUpdatingHardware<T>(hardware, isDeleted, id, type) will attempt to update the hardware entity fields
         *   and also create an entity on the hardware history recording the change.
         * Return IActionResult 200 if the updating works and 400 if there is an error.
         */
        private IActionResult TryUpdatingHardware<T>(T hardware, bool isDeleted, int id, string type)
            where T : class, IHardwareBase
        {
            try
            {
                UpdateHardwareEntity(hardware, isDeleted);
                UpdateHardwareHistory(hardware.EmployeeId, type, id, isDeleted ? "Archived" : "Recovered", DateTime.Now);
                _context.SaveChanges();

                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* UpdateHardwareEntity<T>(hardware, isDeleted) will update the assignment of the hardware
         *   if the EmployeeId is not null and will also update the IsDeleted field according to the
         *   parameter passed.
         */
        private void UpdateHardwareEntity<T>(T hardware, bool isDeleted)
            where T : class, IHardwareBase
        {
            if (!isDeleted && hardware.EmployeeId != null)
            {
                hardware.IsAssigned = true;
            }
            // Not assigned if isDeleted == true or if entity.EmployeeId == null
            else
            {
                hardware.IsAssigned = false;
            }
            hardware.IsDeleted = isDeleted;
        }

        private void UpdateHardwareAssigning<T>(int employeeId)
            where T : class, IHardwareBase
        {
            // Get the table of the entity's type.
            DbSet<T> table = _context.Set<T>();
            foreach (var hw in table.Where(x => x.EmployeeId == employeeId))
            {
                UpdateHardwareAssignment(table, employeeId, false, new HardwareAssignedModel { ID = hw.GetId(), Type = GetClassName(hw) });
            }

        }


        [HttpGet]
        [Route("archivedList/{type}")]
        public IActionResult GetActionResult([FromRoute] string type)
        {
            switch (type.ToLower()) {
                case "employee":
                    return archivedList<Employee>();
                case "program":
                    return archivedList<Models.Program>();
                case "monitor":
                    return archivedList<Monitor>();
                case "computer":
                case "laptop":
                    return archivedList<Computer>();
                case "department":
                    return archivedList<Department>();
                case "peripheral":
                    return archivedList<Peripheral>();
                case "server":
                    return archivedList<Server>();
                default:
                    return BadRequest();
            }

        }

        public IActionResult archivedList<T>()
            where T : class, ISoftDeletable
        {
            var table = _context.Set<T>();
            var list = table.Where(x => x.IsDeleted);
            return Ok(list);
        }

    }
}