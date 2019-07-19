using System;

namespace backend_api.Helpers
{

    // Interface of attributes shared among hardware types.
    public interface IHardwareBase : IAssignable, ISoftDeletable, IPurcahseRenewal
    {
        decimal? CostPerYear { get; set; }
        decimal? FlatCost { get; set; }
        DateTime? PurchaseDate { get; set; }
        int GetId();
        string GetMake();
        string GetModel();
        
    }

}
