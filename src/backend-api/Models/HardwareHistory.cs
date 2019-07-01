using System;
using System.Collections.Generic;

namespace backend_api.Models
{
    public partial class HardwareHistory
    {
        public int HardwareHistoryId { get; set; }
        public int? EmployeeId { get; set; }
        public string HardwareType { get; set; }
        public int HardwareId { get; set; }
        public string EventType { get; set; }
        public DateTime? EventDate { get; set; }

        //   public Employee CurrentOwner { get; set; }
        //  public Employee PreviousOwner { get; set; }
    }
}
