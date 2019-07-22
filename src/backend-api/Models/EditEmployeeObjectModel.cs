using System;

namespace backend_api.Models
{
    public class EditEmployeeObjectModel
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime HireDate { get; set; }
        public string Role { get; set; }
        public int DepartmentID { get; set; }
        public bool IsAdmin { get; set; }

    }
}
