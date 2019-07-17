using System;
using System.Collections.Generic;

namespace backend_api.Models
{
    public partial class Employee
    {

        public Employee() { }
    

        public int EmployeeId { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentID { get; set; }
        public bool IsDeleted { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public Guid Adguid { get; set; }

    }
}
