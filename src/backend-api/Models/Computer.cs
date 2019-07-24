using System;
using backend_api.Helpers;

namespace backend_api.Models
{
    public partial class Computer : IHardwareBase
    {
        public int ComputerId { get; set; }
        public string Cpu { get; set; }
        public int? Ramgb { get; set; }
        public int? Ssdgb { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? RenewalDate { get; set; }
        public decimal? FlatCost { get; set; }
        public string MonitorOutput { get; set; }
        public DateTime? EndOfLife { get; set; }
        public int? EmployeeId { get; set; }
        public bool IsAssigned { get; set; }
        public string TextField { get; set; }
        public decimal? ScreenSize { get; set; }
        public decimal? CostPerYear { get; set; }
        public bool IsDeleted { get; set; }
        public int? Resolution { get; set; }
        public string MFG { get; set; }
        public string Make { get; set; }
        public string Fqdn { get; set; }
        public string Location { get; set; }
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public int? MonthsPerRenewal { get; set; }
        public int GetId() { return ComputerId; }
        public decimal? GetCostPerYear() { return CostPerYear; }
        public decimal? GetFlatCost() { return FlatCost; }
        public DateTime? GetPurchaseDate() { return PurchaseDate; }
        public string GetMake() { return Make; }
        public string GetModel() { return Model; }

    }
}
