using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190701160210)]
    public class _20190701160210_updating_data_stores : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("AuthIDServer")
                .AlterColumn("ActiveDirectoryID")
                .AsGuid();
            Alter.Table("Computer")
                .AlterColumn("TextField")
                .AsString(250)
                .Nullable();
            Alter.Table("Computer")
                .AlterColumn("FQDN")
                .AsString(250)
                .Nullable();
            Alter.Table("Department")
                .AlterColumn("DefaultHardware")
                .AsString(250);
            Alter.Table("Department")
                .AlterColumn("DefaultPrograms")
                .AsString(250);
            Alter.Table("Employee")
                .AlterColumn("UserSettings")
                .AsString(250)
                .Nullable();
            Alter.Table("HardwareHistory")
                .AlterColumn("EventType")
                .AsString(250)
                .Nullable();
            Alter.Table("Monitor")
                .AlterColumn("TextField")
                .AsString(250)
                .Nullable();
            Alter.Table("Peripheral")
                .AlterColumn("TextField")
                .AsString(250)
                .Nullable();
            Alter.Table("Plugins")
                .AlterColumn("TextField")
                .AsString(250)
                .Nullable();
            Alter.Table("Program")
                .AlterColumn("Description")
                .AsString(250)
                .Nullable();
            Alter.Table("Program")
                .AlterColumn("ProgramPurchaseLink")
                .AsString(250)
                .Nullable();
            Alter.Table("ProgramHistory")
                .AlterColumn("EventType")
                .AsString(250)
                .Nullable();
            Alter.Table("Server")
                .AlterColumn("FQDN")
                .AsString(250)
                .Nullable();
            Alter.Table("Server")
                .AlterColumn("TextField")
                .AsString(250)
                .Nullable();




        }
    }
}
