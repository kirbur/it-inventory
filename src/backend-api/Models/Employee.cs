using backend_api.Helpers;
using System;

namespace backend_api.Models
{
    public partial class Employee: ISoftDeletable
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
        public string TextField { get; set; }
        public DateTime? ArchiveDate { get; set; }

    }
}
