using System;
using backend_api.Helpers;

namespace backend_api.Models
{
    public partial class Plugins : IPurchaseRenewal, ISoftDeletable
    {
        public string PluginName { get; set; }
        public int PluginId { get; set; }
        public decimal? PluginFlatCost { get; set; }
        public int ProgramId { get; set; }
        public string TextField { get; set; }
        public decimal? PluginCostPerYear { get; set; }
        public bool IsDeleted { get; set; }
        public string ProgramName { get; set; }
        public DateTime? RenewalDate  { get; set; }
        public int? MonthsPerRenewal { get; set; }
        public bool IsCostPerYear { get; set; }
        public DateTime? DateBought { get; set; } 
        public decimal? GetCostPerYear() { return PluginCostPerYear; }
        public decimal? GetFlatCost() { return PluginFlatCost; }
        public DateTime? GetPurchaseDate() { return DateBought; }
    }
}
