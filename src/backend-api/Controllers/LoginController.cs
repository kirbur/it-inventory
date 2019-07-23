using System;
using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using Microsoft.IdentityModel.Logging;
using backend_api.Helpers;
using Microsoft.Extensions.Options;
using backend_api.Models;
using backend_api;

namespace EFGetStarted.AspNetCore.ExistingDb.Controllers
{

    [Route("api/Login")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        // Instance of appsettings so that we can pull in our secret to create tokens
        private readonly AppSettings _appSettings;
        // Instance of the Database so we can read it and  update it
        private readonly ITInventoryDBContext _context;

        //Constructor for appsettings and database
        public LoginController(IOptions<AppSettings> appSettings, ITInventoryDBContext context)
        {
            _context = context;
            _appSettings = appSettings.Value;
        }

        /* Post: api/Login
        * Returns {
        *          String: Refresh Token,
        *          String: Access Token,
        *          DateTime: ValidTo(expire date)
        *          String: FirstName,
        *          Boolean: IsAdmin
        *         }
        */

        /* Get: api/login
         * Returns 'default' for IIS starter app
         */

        [AllowAnonymous]
        [HttpGet]
        public ActionResult<string> Get()
        {
            return "Default";
        }

        [AllowAnonymous]
        [HttpPost]

        public IActionResult Login([FromBody] AuthRequest request)
        {
            // Creating a context that allows us to connect to our Domain Controller
            using (var adContext = new PrincipalContext(ContextType.Domain, "CQLCORP"))
            {
                // Validating the credentials given with our Active Directory
                // If given credentials are not valid then Unauthorized is returned
                var result = adContext.ValidateCredentials(request.username, request.password);

                //Taking the username and finding the user who might be trying to log in
                var user = UserPrincipal.FindByIdentity(adContext, request.username);
                if (result)
                { 
                    // boolean to store whether the user is an admin
                    bool isAdmin = false;

                    var AccessClaims = new[]
                    {
                        // Get the user's Name (this can be whatever claims you wish)
                        new Claim(ClaimTypes.Name, request.username)
                        };

                    // Read our custom key string into a a usable key object 
                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.Secret));

                    // create some signing credentials using out key
                    // encoding our credentials for security using our key generated from our secret
                    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                    // create a JWT. Here we chose our Audience which determines the uses of our token.
                    // This token has refresh as its only Audience so that it can't be used as an access token
                    // Seeing as this token is our refresh token then it is valid for 10000 minutes(subject to change)
                    var refreshToken = new JwtSecurityToken(
                        issuer: "CQLCORP",
                        audience: "Refresh",
                        expires: DateTime.Now.AddMinutes(10000), // how long you wish the token to be active for
                        signingCredentials: creds);

                    //Same as above except this is an Access token and can't be used as a refresh token
                    //As this is our Access token it is only valid for 15 minutes
                    var accessToken = new JwtSecurityToken(
                       issuer: "CQLCORP",
                       audience: "Access",
                       claims: AccessClaims, // the claims listed above
                       expires: DateTime.Now.AddMinutes(15), // how long you wish the token to be active for
                       signingCredentials: creds);

                    //stringify tokens so they can be returned
                    var Refreshtoken = new JwtSecurityTokenHandler().WriteToken(refreshToken);
                    var Accesstoken = new JwtSecurityTokenHandler().WriteToken(accessToken);

                    //lambda checks if this is the user's first login
                    var ExistingEmployee = _context.AuthIdserver.ToList().Any(x => x.ActiveDirectoryId == user.Guid);

                    //if employee has logged in before
                    if (ExistingEmployee == false)
                    {
                        return BadRequest("Employee trying to login does not exist in the database yet...");
                    }
                    else
                    {
                        //Update their refresh token to the new one just generated and store this in the database
                        var empAuthId = _context.AuthIdserver
                            .FirstOrDefault(x => x.ActiveDirectoryId == user.Guid);
                        empAuthId.RefreshToken = Refreshtoken;
                        _context.SaveChanges();
                        //checks if the employee is an admin
                        isAdmin = _context.AuthIdserver
                            .ToList()
                            .Where(x => x.ActiveDirectoryId == user.Guid)
                            .Select(x => x.IsAdmin)
                            .FirstOrDefault();
                    }

                    // returning the need information about the employee logged in with their tokens
                    List<object> returnList = new List<object>();
                    var returnInformation = new
                    {
                        Refreshtoken,
                        Accesstoken,
                        accessToken.ValidTo,
                        user.GivenName,
                        isAdmin
                    };
                    returnList.Add(returnInformation);

                    return Ok(returnList);
                }

            }

            // if we haven't returned by now, something went wrong and the user is not authorized
            return Unauthorized();
        }

        /* Get: api/Login/AccessToken
        * Returns {
        *          String: Access Token,
        *          DateTime: ValidTo(expire date)
        *         }
        */

        [Route("AccessToken")]
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAccessToken()
        {
            //Take the token from the bearer header and split it from the bearer title
            var TokenList = Request.Headers["Authorization"].ToString().Split(" ");

            //turn stringifyed token into a JWT token
            var JwtToken = new JwtSecurityTokenHandler().ReadJwtToken(TokenList[1]);

            // Checks if the refresh token we have been passed belongs to our database 
            var tokenInDB = _context.AuthIdserver.Any(x => x.RefreshToken == TokenList[1]);

            // if the token is null, if the token does not belong to our database
            // or if the token's audience is not refresh then return unauthorized
            if (JwtToken == null || tokenInDB == false || JwtToken.Audiences.FirstOrDefault() != "Refresh")
            {
                return Unauthorized();
            }
            // Read our custom key string into a a usable key object 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.Secret));

            // create some signing credentials using out key
            // encoding our credentials for security using our key generated from our secret
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // creating a Access token. Same as above except this one has null for its claims as we are not using claims right now
            var accessToken = new JwtSecurityToken(
                       issuer: "CQLCORP",
                       audience: "Access",
                       claims: null, // the claims listed above
                       expires: DateTime.Now.AddMinutes(15), // how long you wish the token to be active for
                       signingCredentials: creds);

            // returning access token with its expire date
            return Ok(new List<object> {new
            {
                Accesstoken = new JwtSecurityTokenHandler().WriteToken(accessToken),
                accessToken.ValidTo
            } });
        }
    }



}

