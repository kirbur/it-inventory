using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190703131410)]
    public class _20190703131410_changing_string_to_guid : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Employee")
                .AlterColumn("ADGUID")
                .AsGuid()
                .NotNullable();
               


        }
    }
}
