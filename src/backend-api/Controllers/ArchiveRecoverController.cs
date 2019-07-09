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
    [ApiController]
    public class ArchiveRecoverController : ContextController
    {
        public ArchiveRecoverController(ITInventoryDBContext context) : base(context) { }

        /* PUT: api/{operation}/{model}/{id}
         * Will change the IsDeleted field for the id of the model corresponding to the operation.
         * {operation} is a string. Either "archive" or "recover"
         * {model} is a string that is a name of one of the models.
         *      Employee, Department, Program, Plugin, Server, Laptop, Monitor, Peripheral
         * {id} is a number that is the ID for any of the models.
         * Return: 200 if updated. Else, 400 bad request. 
         */
        [HttpPut]
        [Route("{operation}/{model}/{id}")]
        public IActionResult ArchiveRecoverSwitch([FromRoute] string operation, string model, int id)
        {
            // Make the model all lower and change "laptop" to "computer".
            model = VerbatimMatch(model);

            // Checks the validity of the operation, and assigns isDeleted to a 
            //      boolean according to the operation provided.
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
                case "department":
                    return ArchiveRecoverDepartment(isDeleted, id);
                case "server":
                    return BadRequest("Not Archived");
                case "computer":
                    return BadRequest("Not Archived");
                case "monitor":
                    return BadRequest("Not Archived");
                case "peripheral":
                    return BadRequest("Not Archived");
                case "plugin":
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
         * Will change the IsDeleted field for the department of the id corresponding to the operation.
         *      Will not archive the department if employees are still assigned to the department.
         * Return: 200 if updated. Else, 400 bad request. 
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
                    // Try to update department row
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
                else
                {
                    return BadRequest("Department does not exist or failed to supply ID");
                }
            }
        }
    }
}