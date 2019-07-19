using System;

namespace backend_api.Models
{
    // Class to get input from a request body.
    public class UpdateProgramInputModel
    {
        public ProgramUpdateObjectModel Program { get; set; }
    }

    // Program object in the input from the request.
    public class ProgramUpdateObjectModel
    {
        public string OldProgramName { get; set; }
        public string ProgramName { get; set; }
        public decimal? ProgramCostPerYear { get; set; }
        public decimal? ProgramFlatCost { get; set; }
        public string ProgramLicenseKey { get; set; }
        public bool? IsLicense { get; set; }
        public string Description { get; set; }
        public string ProgramPurchaseLink { get; set; }
        public DateTime? DateBought { get; set; }
        public DateTime? RenewalDate { get; set; }
        public int? MonthsPerRenewal { get; set; }
    }
}
