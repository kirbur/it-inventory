using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Models;
using backend_api.Helpers;

namespace backend_api.Controllers
{
    // [Authorize]
    [ApiController]
    public class ArchiveRecoverController : ContextController
    {
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
        public IActionResult ArchiveRecoverSwitch([FromRoute] string operation, string model, int id)
        {
            // Make the model all lower and change "laptop" to "computer".
            model = VerbatimMatch(model);

            // Checks the validity of the operation (archive or recover), and assigns 
            //      isDeleted to a boolean according to the operation provided.
            bool isDeleted;
            try
            {
                isDeleted = OperationCheck(operation);
            }
            catch (Exception)
            {
                return BadRequest($"Invalid operation: {operation}");
            }

            switch (model)
            {
                case "employee":
                    return BadRequest("Not Archived");
                case "program":
                    return BadRequest("Not Archived");
                case "plugin":
                    return BadRequest("Not Archived");
                case "department":
                    return ArchiveRecoverDepartment(isDeleted, id);
                case "server":
                    return ArchiveRecoverHardware(_context.Server, isDeleted, id);
                case "computer":
                    return ArchiveRecoverHardware(_context.Computer, isDeleted, id);
                case "monitor":
                    return ArchiveRecoverHardware(_context.Monitor, isDeleted, id);
                case "peripheral":
                    return BadRequest("Not Archived");
                default:
                    return BadRequest("Invalid Model");
            }
        }

        /* OperationCheck(operation) converts the route path string
         *      to a boolean value or throws an error if the string
         *      is not "archive" or "recover".
         * Params: string operation
         * Returns: true if "archive" and false if "recover".
         */
        private bool OperationCheck(string operation)
        {
            operation = operation.ToLower();
            if (operation == "archive")
            {
                return true;
            }
            else if (operation == "recover")
            {
                return false;
            }
            else
            {
                throw new ArgumentException($"invalid operation: {operation}");
            }
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
            where T : class, ISoftDeletable, IAssignable
        {
            // Find hardware entity by ID.
            var hardware = dbSet.Find(id);

            // Find type name at runtime
            string type = hardware.GetType().Name;

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
            where T : class, ISoftDeletable, IAssignable
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
            where T : class, ISoftDeletable, IAssignable
        {
            try
            {
                UpdateHardwareEntity(hardware, isDeleted);
                UpdateHardwareHistory(hardware, isDeleted, id, type);
                _context.SaveChanges();

                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
            }
            catch (Exception e)
            {
                return BadRequest(error: e.Message);
            }
        }

        /* UpdateHardwareEntity<T>(hardware, isDeleted) will update the assigment of the hardware
         *   if the EmployeeId is not null and will also update the IsDeleted field according to the
         *   parameter passed.
         */
        private void UpdateHardwareEntity<T>(T hardware, bool isDeleted)
            where T : class, ISoftDeletable, IAssignable
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

        /* UpdateHardwareHistory<T>(hardware, isDeleted, id, type) will add a row to the hardware history
         *   table recording the change to the hardware entity.
         */
        private void UpdateHardwareHistory<T>(T hardware, bool isDeleted, int id, string type)
            where T : class, ISoftDeletable, IAssignable
        {
            // Update the history: Archive or Recover
            _context.HardwareHistory.Add(new HardwareHistory
            {
                HardwareId = id,
                EmployeeId = hardware.EmployeeId,
                HardwareType = type,
                EventType = $"{(isDeleted ? "Archived" : "Recovered")}",
                EventDate = DateTime.Now,
            });
        }
    }
}