using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.DirectoryServices.AccountManagement;
using Newtonsoft.Json.Linq;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AddController : ControllerBase
    {
        private readonly ITInventoryDBContext _context;

        public AddController(ITInventoryDBContext context)
        {
            _context = context;
        }

        /* GET: api/add/employeePrep
         * Returns [ {
         *              "myDomainUsers" : [
         *                  EmployeeName : string(with space between first and last name)
         *                  ], for all employees that are not currently in the database
         *              "departments" : [
         *                  {
         *                      "departmentName" : string,
         *                      "departmentID" : 8,
         *                      "icon": partial URL (as string),
         *                      "defaultHardware" [
         *                          ] all default hardware of each department,
         *                      "defaultLicenses" [
         *                          ] all default licenses of each department,
         *                      "defaultSoftware" [
         *                          ] all default software of each department,
         *                     ] for all the departments that are not deleted
         *               "unassigned hardware" : [
         *                  {
         *                      "Id" : int,
         *                      "type" : string,
         *                      "name" : string,
         *                      ] for all the unassigned hardware
         *                  }
         *                  "unassigned software" : [
         *                  {
         *                      "Id" : int,
         *                      "type" : string,
         *                      "name" : string,
         *                      ] for all the unassigned software
         *                  }
         *                  "unassigned licenses" : [
         *                  {
         *                      "Id" : int,
         *                      "type" : string,
         *                      "name" : string,
         *                      } for all the unassigned licenses
         *                  ]
         *            }
         *    ]        
         */

        [HttpGet]
        [Route("EmployeePrep")]
        public IActionResult GetEmployeePrep()
        {
            // list to hold CQL distribution employees that are not currently added to the application
            var myDomainUsers = new List<string>();

            // Finding our Active Directory.
            using (var ctx = new PrincipalContext(ContextType.Domain, "CQLCORP"))
            {
                var userPrinciple = new UserPrincipal(ctx);
                // Finding the CQL distribution group within AD
                GroupPrincipal gp = GroupPrincipal.FindByIdentity(ctx, "CQL Distribution");

                var ADIds = _context.Employee.Select(x => x.Adguid).ToList();
                // loop to check all employees if they exist and have not yet been added to our database.
                // if they are not added then add their name to our list of people possible to add.
                using (var search = new PrincipalSearcher(userPrinciple))
                {
                    foreach (var domainUser in search.FindAll())
                    {
                        if (domainUser.DisplayName != null && domainUser.Guid != null && domainUser.IsMemberOf(gp) && !ADIds.Contains(domainUser.Guid.Value))
                        {
                            myDomainUsers.Add(domainUser.DisplayName);
                        }
                    }
                }

            }

            List<object> departments = new List<object>();
            foreach (var dep in _context.Department.Where(x => x.IsDeleted == false))
            {
                // if the department is any department apart from utilities does not have default programs
                if (dep.DepartmentName != "Utilities")
                {
                    // pull stringifyed default hardware and software out into a nice JSON object :) using JSON package.
                    JObject defaultHardware = JObject.Parse(dep.DefaultHardware);
                    JObject defaultPrograms = JObject.Parse(dep.DefaultPrograms);

                    // image for the department
                    string icon = $"/image/department/{dep.DepartmentId}";

                    // the necessary returnables
                    departments.Add(new
                    {
                        dep.DepartmentName,
                        dep.DepartmentId,
                        icon,
                        DefaultHardware = defaultHardware["DefaultHardware"],
                        DefaultLicenses = defaultPrograms["license"],
                        DefaultSoftware = defaultPrograms["software"],
                    });
                }

                // if the department is utilities then it does not have default programs
                else
                {
                    string icon = $"/image/department/{dep.DepartmentId}";

                    departments.Add(new
                    {
                        dep.DepartmentName,
                        dep.DepartmentId,
                        icon
                    });

                }
            }

            // list that will hold the unassigned hardware
            List<object> UnassignedHardware = new List<object>();

            // loop with lambda that finds the unassigned, not deleted monitors and adds the necessary returnables of them into a list 
            foreach (var mon in _context.Monitor.Where(x => x.EmployeeId == null && x.IsDeleted == false))
            {
                var monitorName = mon.Make + " " + mon.Model;
                var monitor = new
                {
                    mon.MonitorId,
                    type = nameof(Monitor),
                    monitorName
                };
                UnassignedHardware.Add(monitor);
            }
            // loop with lambda that finds the unassigned, not deleted servers and adds the necessary returnables of them into a list 
            foreach (var serv in _context.Server.Where(x => x.EmployeeId == null && x.IsDeleted == false))
            {
                var serverName = serv.Make + " " + serv.Model;
                var server = new
                {
                    serv.ServerId,
                    type = nameof(Server),
                    serverName
                };
                UnassignedHardware.Add(server);
            }

            // loop with lambda that finds the unassigned, not deleted computers and adds the necessary returnables of them into a list 
            foreach (var comp in _context.Computer.Where(x => x.EmployeeId == null && x.IsDeleted == false))
            {
                var compName = comp.Make + " " + comp.Model;
                var computer = new
                {
                    comp.ComputerId,
                    type = nameof(Computer),
                    compName
                };
                UnassignedHardware.Add(computer);
            }

            // loop with lambda that finds the unassigned, not deleted peripherals and adds the necessary returnables of them into a list 
            foreach (var periph in _context.Peripheral.Where(x => x.EmployeeId == null && x.IsDeleted == false))
            {
                var periphName = periph.PeripheralName + " " + periph.PeripheralType;
                var peripheral = new
                {
                    periph.PeripheralId,
                    type = nameof(Peripheral),
                    periphName
                };
                UnassignedHardware.Add(peripheral);
            }

            // Unassigned programs lists for returning purposes
            List<object> UnassignedSoftware = new List<object>();
            List<object> UnassignedLicenses = new List<object>();

            // loop and lambda to find all the distinct programs that have any of their individual programs unassigned and loop though them
            foreach (var prog in _context.Program.Where(x => x.EmployeeId == null && x.IsDeleted == false).GroupBy(prog => prog.ProgramName).Select(x => x.FirstOrDefault()).ToList())
            {
                // for the licenses list
                if (prog.IsLicense == false)
                {
                    var SW = new
                    {
                        prog.ProgramName,
                        prog.ProgramId,
                        type = nameof(Program)
                    };
                    UnassignedSoftware.Add(SW);
                }
                // for the software list
                else
                {
                    var license = new
                    {
                        prog.ProgramName,
                        prog.ProgramId,
                        type = nameof(Program)
                    };
                    UnassignedLicenses.Add(license);
                }
            }

            var empPrep = (new
            {
                myDomainUsers,
                departments,
                UnassignedHardware,
                UnassignedSoftware,
                UnassignedLicenses
            });
            return Ok(new List<object> { empPrep });
        }


        [HttpPost]
        [Route("Employee")]
        public IActionResult PostEmployee([FromBody] PostEmployeeInputModel input)
        {
            // concatenating first and last name for comparison reasons
            var userName = input.Employee.FirstName + "." + input.Employee.LastName;

            // find our active directory context so we can find the guid of the employee we are adding.
            using (var adContext = new PrincipalContext(ContextType.Domain, "CQLCORP"))
            {
                var user = UserPrincipal.FindByIdentity(adContext, userName);
                // creating employee object to added to the database and then saved.
                var emp =new Employee()
                {
                    HireDate = input.Employee.HireDate,
                    DepartmentID= input.Employee.DepartmentID,
                    IsDeleted = false,
                    UserSettings = "",
                    FirstName = input.Employee.FirstName,
                    LastName = input.Employee.LastName,
                    Email = "",
                    Role = input.Employee.Role,
                    Adguid = user.Guid.Value
                };
                _context.Employee.Add(emp);
                _context.SaveChanges();


                // if there is any hardware that is to be assigned from the front end
                if (input.HardwareAssigned != null)
                {
                    // loop through hardware and depending on what type the hardware is, then add the hardware to the specific table. 
                    foreach (var hardware in input.HardwareAssigned)
                    {
                        switch (hardware.Type)
                        {
                            case "Monitor":
                                var mon = _context.Monitor.Find(hardware.ID);
                                mon.EmployeeId = emp.EmployeeId;
                                mon.IsAssigned = true;
                                _context.SaveChanges();
                                break;
                            case "Peripheral":
                                var periph = _context.Peripheral.Find(hardware.ID);
                                periph.EmployeeId = emp.EmployeeId;
                                periph.IsAssigned = true;
                                break;
                            case "Computer":
                                var comp = _context.Computer.Find(hardware.ID);
                                comp.EmployeeId = emp.EmployeeId;
                                comp.IsAssigned = true;
                                break;
                            case "Server":
                                var server = _context.Server.Find(hardware.ID);
                                server.EmployeeId = emp.EmployeeId;
                                server.IsAssigned = true;
                                break;

                        }

                    }
                }
                // if there are any programs to be assigned from the front-end
                if (input.ProgramAssigned != null)
                {
                    foreach (var program in input.ProgramAssigned)
                    {
                        var prog = _context.Program.Find(program.ID);
                        prog.EmployeeId = emp.EmployeeId;
                        _context.SaveChanges();
                    }
                }

                // if we get here then the various fields were created and changed and now we can return 201 created.
                return StatusCode(201);
            }
        }
    }
}