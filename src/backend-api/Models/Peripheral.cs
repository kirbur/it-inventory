using System;
using backend_api.Helpers;

namespace backend_api.Models
{
    public partial class Peripheral : IHardwareBase
    {
        public int PeripheralId { get; set; }
        public string PeripheralName { get; set; }
        public string PeripheralType { get; set; }
        public string TextField { get; set; }
        public int? EmployeeId { get; set; }
        public bool IsAssigned { get; set; }
        public decimal? FlatCost { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? CostPerYear { get; set; }
        public bool IsDeleted { get; set; }
        public string MFG { get; set; }
        public string Location { get; set; }
        public DateTime? RenewalDate { get; set; }
        public string SerialNumber { get; set; }
        public int? MonthsPerRenewal { get; set; }
        public int GetId() { return PeripheralId; }
        public decimal? GetCostPerYear() { return CostPerYear; }
        public decimal? GetFlatCost() { return FlatCost; }
        public DateTime? GetPurchaseDate() { return PurchaseDate; }
        public string GetMake() { return PeripheralName; }
        public string GetModel() { return PeripheralType; }

    }
}
