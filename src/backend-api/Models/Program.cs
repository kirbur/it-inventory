using System;
using backend_api.Helpers;

namespace backend_api.Models
{
    public class Program : IPurcahseRenewal, ISoftDeletable
    {
        public Program() { }

        public int ProgramId { get; set; }
        public string ProgramName { get; set; }
        public decimal? ProgramCostPerYear { get; set; }
        public decimal? ProgramFlatCost { get; set; }
        public string ProgramLicenseKey { get; set; }
        public bool IsLicense { get; set; }
        public int? EmployeeId { get; set; }
        public string Description { get; set; }
        public string ProgramPurchaseLink { get; set; }
        public bool HasPlugIn { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsCostPerYear { get; set; }
        public DateTime? DateBought { get; set; }
        public DateTime? RenewalDate { get; set; }
        public int? MonthsPerRenewal { get; set; }
        public bool IsPinned { get; set; }

        public decimal? GetCostPerYear() { return ProgramCostPerYear; }
        public decimal? GetFlatCost() { return ProgramFlatCost; }
        public DateTime? GetPurchaseDate() { return DateBought; }
    }
}
