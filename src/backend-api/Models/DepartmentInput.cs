namespace backend_api.Models
{
    public class DepartmentInput
    {
        public struct ProgramsObject
        {
            public string[] license;
            public string[] software;
        }
        public struct HardwareObject
        {
            public string[] DefaultHardware;
        }
        public string Name { get; set; }
        public HardwareObject DefaultHardware { get; set; }
        public ProgramsObject DefaultPrograms { get; set; }
        public int? ID { get; set; }
    }
}
