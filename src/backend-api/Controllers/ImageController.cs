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
        /* GET: api/image/{model}/{id}
         *      Return: The requested image of the model with the ID
         *      Will return null if the image does not exist.
         */
        [HttpGet]
        [Route("{model}/{id}")]
        public IActionResult GetPicture([FromRoute] string model, int id)
        {
            PhysicalFileResult image = null;
            try
            {
                // TODO: Replace C:\\ with the root path.
                image = new PhysicalFileResult($"C:\\images\\{model}\\{id}", "image/jpeg");
            }
            catch
            {

            }
            return image;
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
            if (file.Length > 0)
            {
                // Path to where the file is saved locally.
                // TODO: Create an environment variable that is the root of the image path. Replace C:\\
                //string path = Path.Combine(env.WebRootPath, "uploadFiles");

                // TODO: MAKE SURE MODEL IS ONE OF THE SPECIFIED
                // Note: the folder needs to be created before images can be added.
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
