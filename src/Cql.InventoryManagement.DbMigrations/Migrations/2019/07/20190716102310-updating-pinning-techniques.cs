using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190716102310)]
    public class _20190716102310_updating_pinning_techniques : Migration
    {
        public override void Up()
        {
            Delete.Column("UserSettings")
               .FromTable("Employee");
            Alter.Table("Program")
                .AddColumn("IsPinned")
                .AsBoolean()
                .NotNullable()
                .WithDefaultValue(false);
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
