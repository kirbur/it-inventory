namespace backend_api.Models
{
    public class EditEmployeeInputModel
    {
        public EditEmployeeObjectModel Employee { get; set; }
        public HardwareAssignedModel[] HardwareAssigned { get; set; }
        public HardwareAssignedModel[] HardwareUnassigned { get; set; }
        public ProgramAssignedModel[] ProgramAssigned { get; set; }
        public ProgramAssignedModel[] ProgramUnassigned { get; set; }
    }
}

