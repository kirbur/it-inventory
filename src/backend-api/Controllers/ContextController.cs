using System;
using System.Linq;
using backend_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api")]
    [ApiController]
    public class ContextController : ControllerBase
    {
        public readonly ITInventoryDBContext _context;

        public ContextController(ITInventoryDBContext context)
        {
            _context = context;
        }

        // TODO: Abstract this reused code from this and the image controller.
        /* Change the front end to match the back end verbatim. 
         * Return: "computer" if "laptop" is matched.
         * Else: return the same string.
         */
        public string VerbatimMatch(string routeModel)
        {
            return routeModel.ToLower() == "laptop" ? "computer" : routeModel.ToLower();
        }

    }
}