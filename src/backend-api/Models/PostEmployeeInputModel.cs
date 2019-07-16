using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class PostEmployeeInputModel
{
        public PostEmployeeInputModel() { }

        public EmployeeObjectModel Employee { get; set; }

        public HardwareAssignedModel[] HardwareAssigned { get; set; }

        public ProgramAssignedModel[] ProgramAssigned { get; set; }
    }
}
