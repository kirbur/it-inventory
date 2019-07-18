using System;

namespace backend_api.Helpers
{
    // Interface for archiving items
    public interface ISoftDeletable
    {
        bool IsDeleted { get; set; }
    }

    // Interface for assigning items
    public interface IAssignable
    {
        int? EmployeeId { get; set; }
        bool IsAssigned { get; set; }
    }

    // Interface for renewal dates and costs
    public interface IPurcahseRenewal
    {
        DateTime? RenewalDate { get; set; }
        int? MonthsPerRenewal { get; set; }
        decimal? GetCostPerYear();
        decimal? GetFlatCost();
        DateTime? GetPurchaseDate();

    }

}
