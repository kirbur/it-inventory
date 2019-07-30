using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190739120610)]
    public class _20190739120610_change_location_to_string : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Server")
                .AlterColumn("Location")
                .AsString()
                .Nullable();
            Alter.Table("Computer")
                .AlterColumn("Location")
                .AsString()
                .Nullable();
            Alter.Table("Monitor")
                .AlterColumn("Location")
                .AsString()
                .Nullable();
            Alter.Table("Peripheral")
                .AlterColumn("Location")
                .AsString()
                .Nullable();
        }
    }
}
