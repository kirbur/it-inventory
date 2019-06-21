using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cql.InventoryManagement.DbMigrations.Migrations._2019._06
{
   
        [Migration(20190620141310)]
        public class _20190620143210_change_date_sproc : Migration
        {
            public override void Down()
            {
                throw new NotImplementedException();
            }

            public override void Up()
            {
            Execute.EmbeddedScript("Cql.InventoryManagement.DbMigrations.Resources.Sql.20190620143210-change-date-sproc.sql");
        }
        }
    

}
