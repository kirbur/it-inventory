using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class EmployeeObjectModel
    {
        public EmployeeObjectModel()
        {
        }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime HireDate { get; set; }
        public string Role { get; set; }
        public int DepartmentID { get; set; }
       

    }

}

