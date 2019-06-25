using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._06
{
    [Migration(20190625112710)]
    public class _20190625112710_add_serial_number_to_hardware : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Computer")
                .AddColumn("SerialNumber")
                .AsString(200)
                .Nullable()
                .WithDefaultValue("1212524-234566-23");
            Alter.Table("Monitor")
                .AddColumn("SerialNumber")
                .AsString(200)
                .Nullable()
                .WithDefaultValue("5734657-3457-864");
            Alter.Table("Peripheral")
                .AddColumn("SerialNumber")
                .AsString(200)
                .Nullable()
                .WithDefaultValue("846568-45623-7465");
            Alter.Table("Server")
                .AddColumn("SerialNumber")
                .AsString(200)
                .Nullable()
                .WithDefaultValue("84568654-3455-2765463");
        }
    }
}
