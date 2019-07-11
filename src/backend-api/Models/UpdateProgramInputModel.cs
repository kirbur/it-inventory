using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class UpdateProgramInputModel
    {
        public UpdateProgramInputModel() { }
        public ProgramUpdateObjectModel Program{ get; set; }
    }
}
