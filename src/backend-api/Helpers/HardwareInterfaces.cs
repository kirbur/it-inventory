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
}
