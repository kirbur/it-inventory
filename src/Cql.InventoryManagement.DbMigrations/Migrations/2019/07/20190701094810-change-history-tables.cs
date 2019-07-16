using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._07
{
    [Migration(20190701094810)]
    public class _20190701094810_change_history_tables : Migration
    {
        public override void Up()
        {
            Delete.Column("EventName")
                .FromTable("ProgramHistory");
            Delete.Column("CurrentOwnerStartDate")
                .FromTable("ProgramHistory");
            if (Schema.Table("ProgramHistory").Constraint("FK_ProgramHistory_Employee1").Exists())
            {
                Delete.ForeignKey("FK_ProgramHistory_Employee1").OnTable("ProgramHistory");
            }
            Delete.Column("PreviousOwnerID")
                .FromTable("ProgramHistory");
            Rename.Column("EventDescription")
                .OnTable("ProgramHistory")
                .To("EventType");
            Rename.Column("CurrentOwnerID")
                .OnTable("ProgramHistory")
                .To("EmployeeId");

            Delete.Column("EventName")
                .FromTable("HardwareHistory");
            Delete.Column("CurrentOwnerStartDate")
                .FromTable("HardwareHistory");
            if (Schema.Table("HardwareHistory").Constraint("FK_HardwareHistory_Employee1").Exists())
            {
                Delete.ForeignKey("FK_HardwareHistory_Employee1").OnTable("HardwareHistory");
            }
            Delete.Column("PreviousOwnerID")
                .FromTable("HardwareHistory");
            Rename.Column("EventDescription")
                .OnTable("HardwareHistory")
                .To("EventType");
            Rename.Column("CurrentOwnerID")
                .OnTable("HardwareHistory")
                .To("EmployeeId");



        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
