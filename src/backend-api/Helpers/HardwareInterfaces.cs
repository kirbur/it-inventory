using System;

namespace backend_api.Helpers
{

    // Interface of attributes shared among hardware types.
    public interface IHardwareBase : IAssignable, ISoftDeletable, IPurchaseRenewal
    {
        decimal? CostPerYear { get; set; }
        decimal? FlatCost { get; set; }
        DateTime? PurchaseDate { get; set; }
        int GetId();
        string GetMake();
        string GetModel();
        string MFG { get; set; }
        string SerialNumber { get; set; }

        
    }

}
