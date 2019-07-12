using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190711114010)]
    public class _20190711114010_adding_plugins_datebought : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Plugins")
                .AddColumn("DateBought")
                .AsDateTime()
                .NotNullable()
                .WithDefaultValue(1800);
        }
    }
}
