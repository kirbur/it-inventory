using backend_api.Helpers;
using System;
using System.Collections.Generic;

namespace backend_api.Models
{
    public partial class Department: ISoftDeletable
    {
        public Department()
        {
        }

        public int DepartmentId { get; set; }
        public string DefaultHardware { get; set; }
        public string DefaultPrograms { get; set; }
        public string DepartmentName { get; set; }
        public bool IsDeleted { get; set; }

    }
}
