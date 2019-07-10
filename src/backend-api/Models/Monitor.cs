using System;
using backend_api.Helpers;

namespace backend_api.Models
{
    public interface IMonitorBase
    {
        string Make { get; set; }
        string Model { get; set; }
        int? Resolution { get; set; }
        string Inputs { get; set; }
        int? EmployeeId { get; set; }
        bool IsAssigned { get; set; }
        string TextField { get; set; }
        DateTime? PurchaseDate { get; set; }
        decimal? FlatCost { get; set; }
        decimal? CostPerYear { get; set; }
        bool IsDeleted { get; set; }
        double? ScreenSize { get; set; }
        string Mfg { get; set; }
        DateTime? RenewalDate { get; set; }
        string Location { get; set; }
        string SerialNumber { get; set; }
    }
    public partial class Monitor : IAssignable, ISoftDeletable, IMonitorBase
    {
        public Monitor(IMonitorBase mn)
        {
            // TODO: Can call another constructor to assign the things of the same names.
            Make = mn.Make;
            Model = mn.Model;
            Resolution = mn.Resolution;
            Inputs = mn.Inputs;
            EmployeeId = mn.EmployeeId;
            IsAssigned = mn.IsAssigned;
            TextField = mn.TextField;
            PurchaseDate = mn.PurchaseDate;
            FlatCost = mn.FlatCost;
            CostPerYear = mn.CostPerYear;
            IsDeleted = mn.IsDeleted;
            ScreenSize = mn.ScreenSize;
            Mfg = mn.Mfg;
            RenewalDate = mn.RenewalDate;
            Location = mn.Location;
            SerialNumber = mn.SerialNumber;
        }

        public Monitor() { }

        public int MonitorId { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public int? Resolution { get; set; }
        public string Inputs { get; set; }
        public int? EmployeeId { get; set; }
        public bool IsAssigned { get; set; }
        public string TextField { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? FlatCost { get; set; }
        public decimal? CostPerYear { get; set; }
        public bool IsDeleted { get; set; }
        public double? ScreenSize { get; set; }
        public string Mfg { get; set; }
        public DateTime? RenewalDate { get; set; }
        public string Location { get; set; }
        public string SerialNumber { get; set; }

        // public Employee Employee { get; set; }
    }
}
