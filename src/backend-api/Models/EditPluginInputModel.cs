using System;

namespace backend_api.Models
{
    public class EditPluginInputModel
    {
        public int PluginId { get; set; }
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
