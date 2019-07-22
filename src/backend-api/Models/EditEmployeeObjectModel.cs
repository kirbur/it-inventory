using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class EditEmployeeObjectModel
    {
        public EditEmployeeObjectModel()
        {
        }
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime HireDate { get; set; }
        public string Role { get; set; }
        public int DepartmentID { get; set; }
        public bool IsAdmin { get; set; }
        public string TextField { get; set; }
        public DateTime? ArchiveDate { get; set; }

    }
}
