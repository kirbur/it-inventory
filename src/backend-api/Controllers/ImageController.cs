using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend_api.Models;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/image")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private string[] models = new string[] { "employee", "department", "program", "server", "computer", "server", "monitor", "peripheral" };

        /*  ValidModel ensures the model requested is an actual model
         *  Returns true if the routeModel is an actual model,
         *      false otherwise.
         */
        public bool ValidModel(string routeModel)
        {
            if (models.Contains(routeModel.ToLower()))
            {
                return true;
            }
            return false;
        }

        /* GET: api/image/{model}/{id}
         *      Return: The requested image of the model with the ID
         *      Will return null if the image does not exist.
         */
        [HttpGet]
        [Route("{model}/{id}")]
        public IActionResult GetPicture([FromRoute] string model, int id)
        {
            // TODO: Replace C:\\ with the root path.
            string path = Path.Combine($"C:\\", $"images\\{model}\\{id}");
            if (ValidModel(model))
            {
                if (System.IO.File.Exists(path))
                {
                    return new PhysicalFileResult(path, "image/jpeg");
                }
                return NoContent();
            }
            return BadRequest("Invalid Model");
        }

        /* PUT: api/image/{model}/{id}
         *      Will store the image in the model folder
         *      and the file name will be the ID of the model.
         *      This will overwrite any previous file with the name in the folder.
         *      
         *      Return 200 if image was saved to file system.
         *      Return 400 if the file was not anything or if the model is wrong
         */
        [HttpPut]
        [Route("{model}/{id}")]
        public async Task<IActionResult> Upload([FromForm] PicturePayload payload, [FromRoute] string model, int id)
        {
            var file = payload.File;
            if (ValidModel(model) && file.Length > 0)
            {
                // Path to where the file is saved locally.
                // TODO: Create an environment variable that is the root of the image path. Replace C:\\
                // Note: The folder needs to exist before images can be added.
                string path = Path.Combine("C:\\", $"images\\{model}\\{id}");

                // Create a fileStream used to store.
                using (var fs = new FileStream(path, FileMode.Create))
                {
                    // Copy the file to the local hard drive.
                    await file.CopyToAsync(fs);
                }
                return Ok();
            }
            return BadRequest();
        }
    }
}
