using System;

namespace backend_api.Helpers
{
    // Interface for archiving hardware
    public interface ISoftDeletable
    {
        bool IsDeleted { get; set; }
    }

    // Interface for assigning hardware
    public interface IAssignable
    {
        int? EmployeeId { get; set; }
        bool IsAssigned { get; set; }
    }

    // Interface of attributes shared among hardware types.
    public interface IHardwareBase : IAssignable, ISoftDeletable
    {
        int GetId();
        DateTime? PurchaseDate { get; set; }
        decimal? FlatCost { get; set; }
        string GetMake();
        string GetModel();
        
    }
}
