using System;
using System.Collections.Generic;

namespace backend_api.Models
{
    public partial class ProgramHistory
    {
        public int ProgramHistoryId { get; set; }
        public int? EmployeeId { get; set; }
        public int ProgramId { get; set; }
        public string EventType { get; set; }
        public DateTime EventDate { get; set; }

        //public Employee CurrentOwner { get; set; }
        //public Employee PreviousOwner { get; set; }
        //public Program Program { get; set; }
    }
}
