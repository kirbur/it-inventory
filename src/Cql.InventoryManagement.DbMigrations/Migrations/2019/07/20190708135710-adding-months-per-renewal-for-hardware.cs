using System;
using System.Collections.Generic;
using System.Text;
using FluentMigrator;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190708135710)]
    public class _20190708135710_adding_months_per_renewal_for_hardware : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Peripheral")
                .AddColumn("MonthsPerRenewal")
                .AsInt32()
                .Nullable();
            Alter.Table("Monitor")
                .AddColumn("MonthsPerRenewal")
                .AsInt32()
                .Nullable();
            Alter.Table("Computer")
                .AddColumn("MonthsPerRenewal")
                .AsInt32()
                .Nullable();
            Alter.Table("Server")
                .AddColumn("MonthsPerRenewal")
                .AsInt32()
                .Nullable();
        }
    }
}
