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
using backend_api.Helpers;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/image")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        public IConfiguration Configuration { get; }
        public string UploadedFileRootPath { get; set; }
        public UploadController(IConfiguration configuration)
        {
            Configuration = configuration;
            UploadedFileRootPath = Configuration.GetSection("EnvironmentVariables").Get<EnvironmentVariables>().UploadedFileRootPath;
        }

        private string[] models = new string[] { "employee", "department", "program", "server", "computer", "server", "monitor", "peripheral" };

        /*  ValidModel ensures the model requested is an actual model
         *  Return: true if the routeModel is an actual model,
         *      false otherwise.
         */
        private bool ValidModel(string routeModel)
        {
            if (models.Contains(routeModel.ToLower()))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /* Change the front end to match the back end verbatim. 
         * Return: "computer" if "laptop" is matched.
         * Else: return the same string.
         */
        private string VerbatimMatch(string routeModel)
        {
            return routeModel.ToLower() == "laptop" ? "computer" : routeModel;
        }

        /* GET: api/image/{model}/{id}
         *      Return: The requested image of the model with the ID
         *      Will return null if the image does not exist.
         */
        [HttpGet]
        [Route("{model}/{id}")]
        public IActionResult GetPicture([FromRoute] string model, int id)
        {
            model = VerbatimMatch(model);
            string imagePath = Path.Combine(UploadedFileRootPath, "images", model, $"{id}");

            // Check that the model name is valid.
            if (ValidModel(model))
            {
                // Check that the file exists.
                if (System.IO.File.Exists(imagePath))
                {
                    // Return the file.
                    byte[] bytes = System.IO.File.ReadAllBytes(imagePath);
                    return File(bytes, "image/jpeg");
                }
                else
                {
                    return NoContent();
                }
            }
            else
            {
                return BadRequest("Invalid Model");
            }
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
            model = VerbatimMatch(model);

            // Check that the model is valid and there is content in the file.
            if (ValidModel(model) && file != null && file.Length > 0)
            {
                // Create the images folder if not already there.
                string imagesPath = Path.Combine(UploadedFileRootPath, "images");
                Directory.CreateDirectory(imagesPath);

                // Create model folder if not already there
                string modelPath = Path.Combine(imagesPath, model);
                Directory.CreateDirectory(modelPath);

                // Check that the directory exists. Write permissions could influence the creation.
                if (Directory.Exists(modelPath))
                {
                    // Create a fileStream used to store.
                    using (var fs = new FileStream(modelPath + $"\\{id}", FileMode.Create))
                    {
                        // Copy the file to the local hard drive.
                        await file.CopyToAsync(fs);
                    }
                    return Ok();
                }
                else
                {
                    return BadRequest("Model folder not found.");
                }
            }
            else
            {
                return BadRequest("Invalid model or file is null");
            }
        }
    }
}
