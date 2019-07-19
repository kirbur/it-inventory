using System;

namespace backend_api.Models
{
    // Object to get input from the request body.
    public class PostProgramInputModel
    {
        public ProgramObjectModel Program { get; set; }
    }

    // Program object from the input
    public class ProgramObjectModel
    {
        public ProgramObjectModel() { }
        public int NumberOfPrograms { get; set; }
        public string ProgramName { get; set; }
        public decimal ProgramCostPerYear { get; set; }
        public decimal ProgramFlatCost { get; set; }
        public string ProgramLicenseKey { get; set; }
        public bool IsLicense { get; set; }
        public string Description { get; set; }
        public string ProgramPurchaseLink { get; set; }
        public DateTime DateBought { get; set; }
        public DateTime? RenewalDate { get; set; }
        public int? MonthsPerRenewal { get; set; }
        public int? EmployeeId { get; set; }
    }
}
