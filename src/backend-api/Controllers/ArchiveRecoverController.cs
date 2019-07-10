using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
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
                    return ArchiveRecoverHardware(_context.Server, isDeleted, id);
                    //return ArchiveRecoverServer(isDeleted, id);
                case "computer":
                    return ArchiveRecoverHardware(_context.Computer, isDeleted, id);
                    //return ArchiveRecoverComputer(isDeleted, id);
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
         * Will change the IsDeleted field for the Department of the id corresponding to the operation.
         *      Will not archive the Department if employees are still assigned to the Department.
         * {operation} is a string. Either "archive" or "recover"
         * {id} is a number that is the ID for any of the models.
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

        ///* PUT: api/{operation}/server/{id}
        // * Will change the IsDeleted field for the Server of the id corresponding to the operation.
        // *      Will also add an entry to the Hardware History for the Server
        // * {operation} is a string. Either "archive" or "recover"
        // * {id} is a number that is the ID for any of the models.
        // * Return: 200 if updated. Else, 400 bad request. 
        // */
        //private IActionResult ArchiveRecoverServer(bool isDeleted, int id)
        //{

        //    // Find server by ID.
        //    Server sv = _context.Server.Find(id);

        //    // Make sure server is not null
        //    if (sv != null)
        //    {
        //        // If trying to archive when already archived, or recover when already recovered, 
        //        //      give a BadRequest.
        //        if (sv.IsDeleted == isDeleted)
        //        {
        //            return BadRequest($"Server cannot be {(isDeleted ? "archived if already archived" : "recovered if already recovered")}");
        //        }

        //        // Else, try updating the server fields.
        //        else
        //        {
        //            try
        //            {
        //                // If the server is assigned to an employee when recovered, make IsAssigned be true.
        //                if (!isDeleted && sv.EmployeeId != null)
        //                {
        //                    sv.IsAssigned = true;
        //                }
        //                // Not assigned if isDeleted == true or if sv.EmployeeId == null
        //                else
        //                {
        //                    sv.IsAssigned = false;
        //                }
        //                sv.IsDeleted = isDeleted;

        //                // Update the history: Archive or Recover
        //                _context.HardwareHistory.Add(new HardwareHistory
        //                {
        //                    HardwareId = sv.ServerId,
        //                    EmployeeId = sv.EmployeeId,
        //                    HardwareType = "Server",
        //                    EventType = $"{(isDeleted ? "Archived" : "Recovered")}",
        //                    EventDate = DateTime.Now,
        //                });

        //                _context.SaveChanges();

        //                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
        //            }
        //            catch (Exception e)
        //            {
        //                return BadRequest(error: e.Message);
        //            }
        //        }
        //    }
        //    else
        //    {
        //        return BadRequest("Server does not exist or failed to supply ID");
        //    }
        //}



        ///* PUT: api/{operation}/laptop/{id}
        // * Will change the IsDeleted field for the Computer of the id corresponding to the operation.
        // *      Will also add an entry to the Hardware History for the Computer.
        // *      Will change laptop to match the back-end verbatim of "computer"
        // * {operation} is a string. Either "archive" or "recover"
        // * {id} is a number that is the ID for any of the models.
        // * Return: 200 if updated. Else, 400 bad request. 
        // */


        //// TODO: This is the same function as above with very minor changes....
        //private IActionResult ArchiveRecoverComputer(bool isDeleted, int id)
        //{
        //    // Find computer by ID.
        //    Computer cp = _context.Computer.Find(id);

        //    // Make sure computer is not null
        //    if (cp != null)
        //    {
        //        // If trying to archive when already archived, or recover when already recovered, 
        //        //      give a BadRequest.
        //        if (cp.IsDeleted == isDeleted)
        //        {
        //            return BadRequest($"Computer cannot be {(isDeleted ? "archived if already archived" : "recovered if already recovered")}");
        //        }

        //        // Else, try updating the computer fields.
        //        else
        //        {
        //            try
        //            {
        //                //// If the computer is assigned to an employee when recovered, make IsAssigned be true.
        //                //if (!isDeleted && cp.EmployeeId != null)
        //                //{
        //                //    cp.IsAssigned = true;
        //                //}
        //                //// Not assigned if isDeleted == true or if cp.EmployeeId == null
        //                //else
        //                //{
        //                //    cp.IsAssigned = false;
        //                //}
        //                //cp.IsDeleted = isDeleted;

        //                SoftDelete(cp, isDeleted, id);

        //                // Update the history: Archive or Recover
        //                _context.HardwareHistory.Add(new HardwareHistory
        //                {
        //                    HardwareId = cp.ComputerId,
        //                    EmployeeId = cp.EmployeeId,
        //                    HardwareType = "Computer",
        //                    EventType = $"{(isDeleted ? "Archived" : "Recovered")}",
        //                    EventDate = DateTime.Now,
        //                });

        //                _context.SaveChanges();

        //                return Ok($"{(isDeleted ? "archive" : "recover")} completed");
        //            }
        //            catch (Exception e)
        //            {
        //                return BadRequest(error: e.Message);
        //            }
        //        }
        //    }
        //    else
        //    {
        //        return BadRequest("Computer does not exist or failed to supply ID");
        //    }
        //}

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
                // If trying to archive when already archived, or recover when already recovered, 
                //      give a BadRequest.
                if (hardware.IsDeleted == isDeleted)
                {
                    return BadRequest($"{type} cannot be {(isDeleted ? "archived if already archived" : "recovered if already recovered")}");
                }

                // Else, try updating the hardware fields.
                else
                {
                    try
                    {
                        SoftDelete(hardware, isDeleted, id);

                        // Update the history: Archive or Recover
                        _context.HardwareHistory.Add(new HardwareHistory
                        {
                            HardwareId = id,
                            EmployeeId = hardware.EmployeeId,
                            HardwareType = type,
                            EventType = $"{(isDeleted ? "Archived" : "Recovered")}",
                            EventDate = DateTime.Now,
                        });

                        _context.SaveChanges();

                        return Ok($"{(isDeleted ? "archive" : "recover")} completed");
                    }
                    catch (Exception e)
                    {
                        return BadRequest(error: e.Message);
                    }
                }
            }
            else
            {
                return BadRequest($"{type} does not exist or failed to supply ID");
            }
        }

        // TODO: 
        private void SoftDelete<T>(T hardware, bool isDeleted, int id)
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
    }
}