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
    public class DeleteController : ContextController
    {
        public DeleteController(ITInventoryDBContext context) : base(context) { }

        /* PUT: api/{operation}/{model}/{id}
         * Will change the IsDeleted field for the id of the model corresponding to the operation.
         * Return: 200 if updated. Else, 400 bad request. 
         */
        [HttpPut]
        [Route("{operation}/{model}/{id}")]
        public IActionResult PutDepartment([FromRoute] string operation, string model, int id)
        {
            model = VerbatimMatch(model);

            // Try to change the operation to a boolean.
            bool isDeleted;
            try
            {
                isDeleted = this.isDeleted(operation);
            }
            catch (Exception)
            {
                return BadRequest($"Invalid operation: {operation}");
            }

            switch (model)
            {
                case "employee":
                    return BadRequest("Not Deleted");
                case "program":
                    return BadRequest("Not Deleted");
                case "department":
                    return DeleteServer(isDeleted, id);
                case "server":
                    return BadRequest("Not Deleted");
                case "computer":
                    return BadRequest("Not Deleted");
                case "monitor":
                    return BadRequest("Not Deleted");
                case "peripheral":
                    return BadRequest("Not Deleted");
                default:
                    return BadRequest("Invalid Model");
            }
        }

        /* isDeleted(operation) converts the route path string
         *      to a boolean value or throws an error if the string
         *      is not "delete" or "recover"
         * Params: string operation
         * Returns: boolean.
         */
        private bool isDeleted(string operation)
        {
            operation = operation.ToLower();
            if (operation == "delete")
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
         *      Will not delete the department if employees are still assigned to the department.
         * Return: 200 if updated. Else, 400 bad request. 
         */
        private IActionResult DeleteServer(bool isDeleted, int id)
        {
            // Find if any employees are still assigned to the department.
            int count = _context.Employee.Where(emp => emp.DepartmentID == id).ToList().Count();

            // Cannot delete if there are still employees assigned to the department.
            if (count > 0 && isDeleted)
            {
                return BadRequest($"Cannot delete department. {count} employee{(count > 1 ? "s" : "")} assigned to department");
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

                        return Ok($"{(isDeleted ? "delete" : "recover")} completed");
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