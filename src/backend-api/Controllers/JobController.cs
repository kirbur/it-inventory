using backend_api.Helpers;
using backend_api.Models;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/job")]
    [ApiController]
    public class JobController : DashboardController
    {
        // Enumeration to check the job passed in the route in legit.
        public enum ValidJob
        {
            CostBreakdown,
            LowResource,
        }

        // Helper class to for a license resource. Used in sending emails.
        public class LicenseResource
        {
            public string Name { get; set; }
            public double PercentageInUse { get; set; }
            public int CountOverall { get; set; }
            public int CountInUse { get; set; }
        }

        private readonly EmailSettings _emailSettings;
        private readonly JobSettings _jobSettings;

        public JobController(IOptions<EmailSettings> EmailSettings, IOptions<JobSettings> JobSettings, ITInventoryDBContext context) : base(context)
        {
            _emailSettings = EmailSettings.Value;
            _jobSettings = JobSettings.Value;
        }

        /* PATCH: api/job/{job}
         * {job} is the email operation that we want sent.
         *   Can be either "costbreakdown" or "lowresource".
         * SendCostBreakdown() validates the job request and will send an email according to the job requested.
         * Return 200 if an email was send. 400 otherwise.
         * Note: Made this a patch because it is conflicting with the costBreakdown endpoint from the Dashboard we are inheriting.
         */
        [HttpPatch]
        [Route("{job}")]
        public IActionResult SendCostBreakdownEmail([FromRoute] ValidJob job, [FromHeader] string token)
        {
            // Check the token
            if (token != _jobSettings.AuthToken)
            {
                return BadRequest($"Invalid token: {token}");
            }
            else
            {
                // Email message to be send. 
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("IT Inventory Notifier", "no-reply@cqlcorp.com"));

                // Construct the message based on the job requested.
                if (job == ValidJob.CostBreakdown)
                {
                    message = CostBreakDownMessage(message);
                }
                else if (job == ValidJob.LowResource)
                {
                    List<LicenseResource> lowResources = LowResources();
                    int count = lowResources.Count();
                    if (count > 0)
                    {
                        message = LowResourceMessage(message, lowResources);
                    }
                    else
                    {
                        return Ok($"There are no low resources: {count}");
                    }
                }
                else
                {
                    return BadRequest($"Invalid job: {job}");
                }

                // Connect to client and send email.
                using (var client = new SmtpClient())
                {
                    // Accept all SSL certificates because use is internal.
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    // Set the use of SSL to false because we are using this internally.
                    client.Connect(_emailSettings.SMTP, _emailSettings.Port, false);

                    if (!string.IsNullOrEmpty(_emailSettings.Username))
                    {
                        client.Authenticate(_emailSettings.Username, _emailSettings.Password);
                    }

                    client.Send(message);
                    client.Disconnect(true);
                }
                return Ok("Email sent");
            }
        }

        /* CostBreakdownMessage(message) constructs an email message with the cost breakdown data.
         * Params:
         *   message is an initalized MimeMessage
         * Returns: MimeMessage with the body updated.
         */
        private MimeMessage CostBreakDownMessage(MimeMessage message)
        {
            // Cost breakdown data calculated for the email.
            CostBreakDown costBreakDown = DashboardCostBreakDown();
            decimal totalCost = costBreakDown.CostOfProgramsPerYear + costBreakDown.CostOfPluginsPerYear ?? 0.0m;
            decimal programCost = costBreakDown.CostOfProgramsPerYear ?? 0.0m;
            decimal pluginCost = costBreakDown.CostOfPluginsPerYear ?? 0.0m;

            // Stuff Paid for in the last week. 
            decimal? lastWeekProgramCost = weeklyCostOfItem<Models.Program>();
            decimal? lastWeekPluginsCost = weeklyCostOfItem<Plugins>();
            decimal? lastWeekServerCost = weeklyCostOfItem<Server>();
            decimal? lastWeekComputerCost = weeklyCostOfItem<Computer>();
            decimal? lastWeekMonitorCost = weeklyCostOfItem<Monitor>();
            decimal? lastWeekPeripheralCost = weeklyCostOfItem<Peripheral>();
            decimal lastWeekTotalCost = (decimal)(lastWeekProgramCost + lastWeekPluginsCost + 
                lastWeekServerCost + lastWeekComputerCost + lastWeekMonitorCost + lastWeekPeripheralCost);
            

            // List of people message will be sent to.
            // TODO: Add the actual emails.
            InternetAddressList emails = new InternetAddressList();
            emails.Add(new MailboxAddress("Charles Kornoelje", "charles.kornoelje@cqlcorp.com"));
            message.To.AddRange(emails);

            string date = DateTime.UtcNow.Date.ToString("d");
            message.Subject = $"CQL IT Inventory Cost Breakdown: {date}";

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody =
                $@"
                <head>
                    <style type=""text / css"">
                    p {{
                        font-family: ""Calibri"";
                    }}
                    body {{
                        background-color: #eee;
                    }}
                    </style>
                </head>
                <body>
                    <p>Hello,</p>
                    <p>Here is the cost breakdown for the week {date}:</p>
                    <p>Last week's total cost: ${Math.Round(lastWeekTotalCost, 2)}</p>
                    <p>Last week's program cost: ${Math.Round((decimal)lastWeekProgramCost, 2)}</p>
                    <p>Last week's plugins cost: ${Math.Round((decimal)lastWeekPluginsCost, 2)}</p>
                    <p>Last week's server cost: ${Math.Round((decimal)lastWeekServerCost, 2)}</p>
                    <p>Last week's computer cost: ${Math.Round((decimal)lastWeekComputerCost, 2)}</p>
                    <p>Last week's monitor cost: ${Math.Round((decimal)lastWeekMonitorCost, 2)}</p>
                    <p>Last week's pheripheral cost: ${Math.Round((decimal)lastWeekPeripheralCost, 2)}</p>
                    <p>Last week's cost includes everything paid for in the last week. 
                       Any item bought last week or renewed in the last week will be added to the cost.</p>
                    <hr>
                    <p>Based on the current programs owned, this is the projected monthly and yearly cost.</p>
                    <p>Total Cost: ${totalCost}/yr | ${Math.Round(totalCost / 12, 2)}/mo</p>
                    <p>Cost of Programs: ${programCost}/yr | ${Math.Round(programCost / 12, 2)}/mo</p>
                    <p>Cost of Plugins: ${pluginCost}/yr | ${Math.Round(pluginCost / 12, 2)}/mo</p>
                    <br>
                    <p>- IT Inventory No-Reply</p>
                </body>";

            bodyBuilder.TextBody = "This is some plain text";
            message.Body = bodyBuilder.ToMessageBody();

            return message;
        }

        /* weeklyCostOfItem<T>() calculates the past week's cost for an item. 
         *   If an item was bought within the past week, then it will be added.
         *   If an item was renewed in the last week, it will be added and CostPerYear normalized
         *   to the length of the renewal period (i.e. if something is renewed every month, the
         *   cost the past week will be CostPerYear/12)
         * Returns: deciaml? which is the past week's cost of the item.
         */
        private decimal? weeklyCostOfItem<T>()
            where T : class, IPurcahseRenewal, ISoftDeletable
        {
            DateTime today = DateTime.Today;
            DateTime lastWeek = today.AddDays(-7);
            decimal? costPrograms = _context.Set<T>()
                    // Don't add any costs of deleted things.
                    .Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        // Find the previous renewal date, and also select vars needed in future.
                        PreviousRenewal = x.RenewalDate != null ?
                        x.RenewalDate.Value.AddMonths(x.MonthsPerRenewal != null ? -x.MonthsPerRenewal.Value : -999) : new DateTime(1800),
                        PurcahseDate = x.GetPurchaseDate(),
                        CostPerYear = x.GetCostPerYear() ?? 0.0m,
                        FlatCost = x.GetFlatCost() ?? 0.0m,
                        MonthsPerRenewal = x.MonthsPerRenewal != null ? x.MonthsPerRenewal.Value : 0,
                    })
                .Where(x =>
                    // See if the item was recently purchased or renewed within the last week.
                    ((lastWeek < x.PurcahseDate && x.PurcahseDate < today) ||
                    (lastWeek < x.PreviousRenewal && x.PreviousRenewal < today))
                )
                .Select(x => new
                {
                    // Calculate the cost.
                    recurringCost = (x.MonthsPerRenewal != 0) ? x.CostPerYear / (12.0m / x.MonthsPerRenewal) : 0.0m,
                    initialCost = ((lastWeek < x.PurcahseDate && x.PurcahseDate < today) ? x.FlatCost : 0.0m),
                })
                .Select(x => x.recurringCost + x.initialCost)
                .Sum();

            return costPrograms;
        }

        /* LowResourceMessage(message, lowResource) is a helper method for creating the message body for sending 
         *   a lowResource notification. It will send if there is 1+ license where 80% or more is being used.
         * Returns: message, which has the body filled out for the low resource message.
         */
        private MimeMessage LowResourceMessage(MimeMessage message, List<LicenseResource> lowResources)
        {
            // List of people message will be sent to.
            // TODO: Add the actual emails.
            InternetAddressList emails = new InternetAddressList();
            emails.Add(new MailboxAddress("Charles Kornoelje", "charles.kornoelje@cqlcorp.com"));
            message.To.AddRange(emails);

            message.Subject = $"CQL IT Inventory Low Resource{(lowResources.Count() > 1 ? "s" : "")}: {ResourceNameString(lowResources)}";

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody =
                $@"
                <head>
                    <style type=""text / css"">
                    p {{
                        font-family: ""Calibri"";
                    }}
                    body {{
                        background-color: #eee;
                    }}
                    </style>
                </head>
                <body>
                    <p>Hello,</p>
                    <p>You are getting this notification because a resource is 80% or more in use and you are running low:</p>
                    {LowResourcesString(lowResources)}
                    </br>
                    <p>- IT Inventory No-Reply</p>
                </body>";

            bodyBuilder.TextBody = "This is some plain text";
            message.Body = bodyBuilder.ToMessageBody();

            return message;
        }

        /* LowResources() calculates all of the licenses that are at an 80% or greater use rate.
         * Return: List<LicenseResource>
         */
        private List<LicenseResource> LowResources()
        {
            // All licenses that are not deleted.
            IQueryable<Models.Program> licenses = _context.Program.Where(x => x.IsLicense && !x.IsDeleted);

            // Distinct programs
            IQueryable<Models.Program> distinctLicenses = licenses.GroupBy(x => x.ProgramName).Select(x => x.FirstOrDefault());

            var lowResources = new List<LicenseResource>();

            // Count the programs overall, and the ones in use. Calculate the usage rate.
            foreach (Models.Program license in distinctLicenses)
            {
                int CountProgOverall = licenses.Where(x => x.ProgramName == license.ProgramName).Count();
                int CountProgInUse = licenses.Where(x => x.ProgramName == license.ProgramName && x.EmployeeId != null).Count();
                double percentageInUse = Math.Round((double)CountProgInUse / CountProgOverall, 2);

                if (percentageInUse >= 0.8)
                {
                    lowResources.Add(new LicenseResource()
                    {
                        Name = license.ProgramName,
                        PercentageInUse = percentageInUse,
                        CountOverall = CountProgOverall,
                        CountInUse = CountProgInUse,
                    });
                }
            }

            return lowResources;
        }

        /* LowResourcesString(lowResouces) returns a string is HTML tags for each of the low resources.
         */
        private string LowResourcesString(List<LicenseResource> lowResources)
        {
            string resourceString = "";
            foreach (LicenseResource lr in lowResources)
            {
                resourceString += $"<p>{lr.Name} is {lr.PercentageInUse * 100}% in use ({lr.CountInUse}/{lr.CountOverall}).";
            }
            return resourceString;
        }

        /* ResourceNameString(lowResources) returns the names of each low license with a comma if
         *   there are multiple.
         */
        private string ResourceNameString(List<LicenseResource> lowResources)
        {
            string nameString = "";
            LicenseResource last = lowResources.Last();
            foreach (LicenseResource lr in lowResources)
            {
                nameString += $"{lr.Name}";
                if (!lr.Equals(last))
                {
                    nameString += ", ";
                }
            }
            return nameString;
        }
    }
}
