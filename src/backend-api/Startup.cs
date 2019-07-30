﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using backend_api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Server.IISIntegration;
using Microsoft.AspNet.OData.Extensions;
using System.Text;
using backend_api.Helpers;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace backend_api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();
            // Allows for logged-in windows users to be authenticated.
            // Only works with IIS apps and not running as a console app.

            var appSettingsSection = Configuration.GetSection("AppSettings");
            var appSettings = appSettingsSection.Get<AppSettings>();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.Configure<AppSettings>(appSettingsSection);
            services.Configure<IISOptions>(options =>
            {
                options.AutomaticAuthentication = true;
            });

            //adding jwt authentication to the project
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            //adding the necessary setup for the jwt bearer 
           .AddJwtBearer(x =>
           {
               x.RequireHttpsMetadata = false;
               x.SaveToken = true;
               x.TokenValidationParameters = new TokenValidationParameters
               {
                   ClockSkew = TimeSpan.Zero,
                   ValidateIssuerSigningKey = true,
                   IssuerSigningKey = new SymmetricSecurityKey(key),
                   ValidateIssuer = false,
                   //This makes sure that you can't use access tokens as refresh tokens and vice versa
                   ValidateAudience = true,
                   ValidAudiences = new List<string>
                    {
                        "Access"
                    }
               };
           });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            // Add a DI for the UploadedFileRootPath
            services.Configure<UploadOptions>(x => x.UploadedFileRootPath = Configuration["UploadedFileRootPath"]);

            // Add DI for the email settings.
            IConfigurationSection emailSettingsSection = Configuration.GetSection("EmailSettings");
            services.Configure<EmailSettings>(emailSettingsSection);

            // Add DI for the job settings.
            IConfigurationSection jobSettingsSection = Configuration.GetSection("JobSettings");
            services.Configure<JobSettings>(jobSettingsSection);

            // Add DI for the image settings.
            IConfigurationSection imageSettingsSection = Configuration.GetSection("ImageSettings");
            services.Configure<ImageSettings>(imageSettingsSection);

            // Creates a connection to the db in order to make ITInventoryDBContext available to MVC Controllers.
            services.AddDbContext<ITInventoryDBContext>(options => options.UseSqlServer(Configuration.GetConnectionString("ITInventoryDb")));
            // Allows OData for powerful querying.
            services.AddOData();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            // Set up basic console logging.
            loggerFactory.AddDebug(LogLevel.Debug);
            var logger = loggerFactory.CreateLogger("Startup");
            logger.LogWarning("Logger configured!");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseAuthentication();
            app.UseHttpsRedirection();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Allows for the URL to be appending with query keywords in the API calls.
            app.UseMvc(routeBuilder =>
            {
                routeBuilder.EnableDependencyInjection();
                routeBuilder.Expand().Select().Count().OrderBy();
            });

            app.Run(context =>
            {
                // This is the fallback route allowing all unrouted urls to return index.html (for SPA functionality)
                context.Response.ContentType = "text/html";

                return context.Response.SendFileAsync(Path.Combine(env.WebRootPath, "index.html"));
            });
        }
    }
}
