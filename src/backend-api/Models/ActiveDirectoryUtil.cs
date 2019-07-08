using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public static class ActiveDirectoryUtil
    {
        public static bool IsFirstAdmin(Guid guid)
        {
            
            if( guid == Guid.Parse("811cbf54-2913-4ffc-8f33-6418ddb4e06d"))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
