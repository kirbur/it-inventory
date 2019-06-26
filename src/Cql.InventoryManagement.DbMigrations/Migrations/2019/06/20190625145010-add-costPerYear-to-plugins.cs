using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._06
{
    [Migration(20190625145010)]
    public class _20190625145010_add_costPerYear_to_plugins : AutoReversingMigration
    {

        public override void Up()
        {
            Alter.Table("Plugins")
               .AddColumn("IsCostPerYear")
               .AsBoolean()
               .NotNullable()
               .WithDefaultValue(true);
            Alter.Table("Plugins")
               .AlterColumn("ProgramId")
               .AsInt32()
               .NotNullable();

        }

    }

}
