using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace backend_api.Models
{
    public partial class ITInventoryDBContext : DbContext
    {
        public ITInventoryDBContext()
        {
        }

        public ITInventoryDBContext(DbContextOptions<ITInventoryDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<AuthIdserver> AuthIdserver { get; set; }
        public virtual DbSet<Computer> Computer { get; set; }
        public virtual DbSet<Department> Department { get; set; }
        public virtual DbSet<Employee> Employee { get; set; }
        public virtual DbSet<HardwareHistory> HardwareHistory { get; set; }
        public virtual DbSet<Monitor> Monitor { get; set; }
        public virtual DbSet<Peripheral> Peripheral { get; set; }
        public virtual DbSet<Plugins> Plugins { get; set; }
        public virtual DbSet<Program> Program { get; set; }
        public virtual DbSet<ProgramHistory> ProgramHistory { get; set; }
        public virtual DbSet<Server> Server { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                #warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlServer("Server=CQL-INTERN05\\SQL16;Database=ITInventoryDB;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Computer>(entity =>
            {
                entity.Property(e => e.ComputerId).HasColumnName("ComputerID");

                entity.Property(e => e.CostPerYear).HasColumnType("money");

                entity.Property(e => e.Cpu)
                    .HasColumnName("CPU")
                    .HasMaxLength(50);

                entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

                entity.Property(e => e.EndOfLife).HasColumnType("date");

                entity.Property(e => e.FlatCost).HasColumnType("money");

                entity.Property(e => e.MonitorOutput).HasMaxLength(50);

                entity.Property(e => e.PurchaseDate).HasColumnType("date");

                entity.Property(e => e.Ramgb).HasColumnName("RAMGB");

                entity.Property(e => e.RenewalDate).HasColumnType("date");

                entity.Property(e => e.ScreenSize).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.Ssdgb).HasColumnName("SSDGB");
            });

            modelBuilder.Entity<Department>(entity =>
            {
                entity.Property(e => e.DepartmentId)
                    .HasColumnName("DepartmentID")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.DefaultHardware).IsRequired();

                entity.Property(e => e.DefaultPrograms).IsRequired();

                entity.Property(e => e.DepartmentName)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

                entity.Property(e => e.Adguid)
                    .IsRequired()
                    .HasColumnName("ADGUID")
                    .HasMaxLength(50);

                entity.Property(e => e.DepartmentID).HasColumnName("DepartmentID");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.HireDate).HasColumnType("date");

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasMaxLength(50);

            });

            modelBuilder.Entity<HardwareHistory>(entity =>
            {
                entity.Property(e => e.HardwareHistoryId).HasColumnName("HardwareHistoryID");

            });

            modelBuilder.Entity<Monitor>(entity =>
            {
                entity.Property(e => e.MonitorId).HasColumnName("MonitorID");

                entity.Property(e => e.CostPerYear).HasColumnType("money");

                entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

                entity.Property(e => e.FlatCost).HasColumnType("money");

                entity.Property(e => e.Make).HasMaxLength(100);

                entity.Property(e => e.Model).HasMaxLength(100);

                entity.Property(e => e.Inputs).HasMaxLength(200);

                entity.Property(e => e.PurchaseDate).HasColumnType("date");

            });

            modelBuilder.Entity<Peripheral>(entity =>
            {
                entity.Property(e => e.PeripheralId).HasColumnName("PeripheralID");

                entity.Property(e => e.CostPerYear).HasColumnType("money");

                entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

                entity.Property(e => e.FlatCost).HasColumnType("money");

                entity.Property(e => e.PeripheralName).HasMaxLength(100);

                entity.Property(e => e.PeripheralType).HasMaxLength(50);

                entity.Property(e => e.PurchaseDate).HasColumnType("date");

            });

            modelBuilder.Entity<Plugins>(entity =>
            {
                entity.HasKey(e => e.PluginId);

                entity.Property(e => e.PluginCostPerYear).HasColumnType("money");

                entity.Property(e => e.PluginFlatCost).HasColumnType("money");

                entity.Property(e => e.PluginName)
                    .IsRequired()
                    .HasMaxLength(100);

            });

            modelBuilder.Entity<Program>(entity =>
            {

                entity.Property(e => e.ProgramFlatCost).HasColumnType("money");

                entity.Property(e => e.ProgramCostPerYear).HasColumnType("money");

                entity.Property(e => e.ProgramLicenseKey).HasMaxLength(100);

                entity.Property(e => e.ProgramName)
                    .IsRequired()
                    .HasMaxLength(100);

            });

            modelBuilder.Entity<ProgramHistory>(entity =>
            {
                entity.Property(e => e.ProgramId).HasColumnName("ProgramID");

            });

            modelBuilder.Entity<Server>(entity =>
            {
                entity.Property(e => e.ServerId).HasColumnName("ServerID");

                entity.Property(e => e.CostPerYear).HasColumnType("money");

                entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

                entity.Property(e => e.EndOfLife).HasColumnType("date");

                entity.Property(e => e.FlatCost).HasColumnType("money");

                entity.Property(e => e.Fqdn).HasColumnName("FQDN");

                entity.Property(e => e.OperatingSystem).HasMaxLength(100);

                entity.Property(e => e.PurchaseDate).HasColumnType("date");

                entity.Property(e => e.Ram).HasColumnName("RAM");

                entity.Property(e => e.RenewalDate).HasColumnType("date");
            });
        }
    }
}
