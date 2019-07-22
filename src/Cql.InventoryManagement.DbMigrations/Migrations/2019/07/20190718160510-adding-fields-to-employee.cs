using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190718160510)]
    public class _20190718160510_adding_fields_to_employee : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Employee")
                .AddColumn("ArchiveDate")
                .AsDateTime()
                .Nullable();
            Alter.Table("Employee")
                .AddColumn("TextField")
                .AsString()
                .Nullable();

        }
    }
}
