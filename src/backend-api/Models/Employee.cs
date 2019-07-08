using System;
using System.Collections.Generic;

namespace backend_api.Models
{
    public partial class Employee
    {

        public Employee() { }
        public Employee(DateTime HireDate, int DepartmentID, bool IsDeleted, string UserSettings, string FirstName, string LastName, string email, string role, Guid Adguid )
        {
            this.HireDate = HireDate;
            this.DepartmentID = DepartmentID;
            this.IsDeleted = IsDeleted;
            this.UserSettings = UserSettings;
            this.FirstName = FirstName;
            this.LastName = LastName;
            this.Email = email;
            this.Role = role;
            this.Adguid = Adguid;
        }

        public int EmployeeId { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentID { get; set; }
        public bool IsDeleted { get; set; }
        public string UserSettings { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public Guid Adguid { get; set; }

        //public Department Department { get; set; }
        //public ICollection<Computer> Computer { get; set; }
        //public ICollection<HardwareHistory> HardwareHistoryCurrentOwner { get; set; }
        //public ICollection<HardwareHistory> HardwareHistoryPreviousOwner { get; set; }
        //public ICollection<Monitor> Monitor { get; set; }
        //public ICollection<Peripheral> Peripheral { get; set; }

        //// TODO: This might need to be commented out because the context won't load.
        //// An error could occur if the foreign key (EmployeeID) is null in the program history.
        ////public ICollection<Program> Program { get; set; }
        ////public ICollection<ProgramHistory> ProgramHistoryCurrentOwner { get; set; }
        ////public ICollection<ProgramHistory> ProgramHistoryPreviousOwner { get; set; }
        //public ICollection<Server> Server { get; set; }
    }
}
