using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class PostPluginInputModel
    {
        public PostPluginInputModel() { }

        public string ProgramName { get; set; }

        public string PluginName { get; set; }

        public decimal PluginFlatCost { get; set; }

        public string TextField { get; set; }

        public decimal PluginCostPerYear { get; set; }

        public DateTime? RenewalDate { get; set; }

        public int? MonthsPerRenewal { get; set; }

        public DateTime? DateBought { get; set; }
    }
}
