using System;
using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        /* Change the front end to match the back end verbatim. 
         * Return: "computer" if "laptop" is matched.
         * Else: return the same string.
         */
        public string VerbatimMatch(string routeModel)
        {
            return routeModel.ToLower() == "laptop" ? "computer" : routeModel.ToLower();
        }

        public void UpdateHardwareHistory(bool isAssigned, int? employeeId, int hardwareId, string type)
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
        /* isAdmin() determines if the username from the AccessToken is an admin user.
         *  If the user is an admin, we can choose to return specific values to the front end.
         * Return: boolean. True if the user is an admin, and false otherwise.
         */
        public bool isAdmin()
        {
            // Take the bearer token string, convert it to a Jwt, and find the username from the claims.
            var TokenList = Request.Headers["Authorization"].ToString().Split(" ");

            // If there was no bearer token give, an out of range index error will be thrown.
            try
            {
                var JwtToken = new JwtSecurityTokenHandler().ReadJwtToken(TokenList[1]);
                var username = JwtToken.Claims.First().Value;

                // Check to see if the username is in our AD.
                using (var adContext = new PrincipalContext(ContextType.Domain, "CQLCORP"))
                {
                    var user = UserPrincipal.FindByIdentity(adContext, username);
                    if (user != null)
                    {
                        // Return the isAdmin field from the AuthIDServer matching the Guid.
                        return _context.AuthIdserver.Where(x => x.ActiveDirectoryId == user.Guid.Value).First().IsAdmin;
                    }
                    else
                    {
                        // Return false if the user is not in AuthID.
                        return false;
                    }
                }
            }
            catch (IndexOutOfRangeException)
            {
                return false;
            }

        }

        /* ListOfEmployees() returns a list of employees with concatenated first and last
         *   name with their unique ID. It will check that the employee is not deleted.
         */
        public List<object> ListOfEmployees()
        {
            List<object> ListOfEmployees = new List<object>();
            foreach (var emp in _context.Employee.Where(x => x.IsDeleted == false).ToList())
            {
                string employeeName = emp.FirstName + " " + emp.LastName;
                var employee = new
                {
                    employeeName,
                    emp.EmployeeId
                };
                ListOfEmployees.Add(employee);
            }
            return ListOfEmployees;
        }

        /* GetClassName(obj) returns the name of the class object
         *   as a string at runtime.
         */
        public string GetClassName<T>(T obj)
            where T : class
        {
            return obj.GetType().Name;
        }

    }
}