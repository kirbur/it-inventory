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

        private readonly EmailSettings _emailSettings;

        public JobController(IOptions<EmailSettings> EmailSettings, ITInventoryDBContext context) : base(context)
        {
            _emailSettings = EmailSettings.Value;
        }

        // Authorize the job with a shared secret.
        // Made this a patch because it is conflicting with the costBreakdown endpoint from the Dashboard we are inheriting.
        /* PATCH: api/job/{job}
         * {job} is the email operation that we want sent.
         *   Can be either "costbreakdown" or "lowresource".
         * SendCostBreakdown() validates the job request and will send an email according to the job requested.
         * Return 200 if an email was send. 400 otherwise.
         */
        [HttpPatch]
        [Route("{job}")]
        public IActionResult SendCostBreakdownEmail([FromRoute] ValidJob job, [FromHeader] string token)
        {
            // Check the token
            if (token != _emailSettings.Secret)
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
                        return BadRequest($"There are no low resources: {count}");
                    }
                }
                else
                {
                    return BadRequest($"Invalid job: {job}");
                }

                // Connect to client and send email.
                using (var client = new SmtpClient())
                {
                    // TODO: What does this do?
                    // For demo-purposes, accept all SSL certificates (in case the server supports STARTTLS)
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    // TODO: The boolean value sets useSSL. 
                    client.Connect(_emailSettings.SMTP, _emailSettings.Port, false);

                    // Note: only needed if the SMTP server requires authentication
                    client.Authenticate(_emailSettings.Username, _emailSettings.Password);

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

            // List of people message will be sent to.
            // TODO: Add the actual emails.
            InternetAddressList emails = new InternetAddressList();
            emails.Add(new MailboxAddress("John Doe", "john.doe@cqlcorp.com"));
            emails.Add(new MailboxAddress("Michael Smith", "michael.smith@cqlcorp.com"));
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
                    <p>Total Cost: ${totalCost}/yr | ${Math.Round(totalCost / 12, 2)}/mo</p>
                    <p>Cost of Programs: ${programCost}/yr | ${Math.Round(programCost / 12, 2)}/mo</p>
                    <p>Cost of Plugins: ${pluginCost}/yr | ${Math.Round(pluginCost / 12, 2)}/mo</p>
                    </br>
                    <p>- IT Inventory No-Reply</p>
                </body>";

            bodyBuilder.TextBody = "This is some plain text";
            message.Body = bodyBuilder.ToMessageBody();

            return message;
        }

            // Email message to be send. 
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("IT Inventory Notifier", "no-reply@cqlcorp.com"));
            message.To.AddRange(emails);

            // TODO: Subject and body will be different for each job
            message.Subject = $"CQL IT Inventory Cost Breakdown: {DateTime.UtcNow.Date.ToString("d")}";

            message.Body = new TextPart("plain")
            {
                Text = @"Hi,

Let me know if you got this

-- Sender"
            };

            using (var client = new SmtpClient())
            {
                // TODO: What does this do?
                // For demo-purposes, accept all SSL certificates (in case the server supports STARTTLS)
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                // TODO: The boolean value sets useSSL. 
                client.Connect(_emailSettings.SMTP, _emailSettings.Port, false);

                // Note: only needed if the SMTP server requires authentication
                client.Authenticate(_emailSettings.Username, _emailSettings.Password);

                client.Send(message);
                client.Disconnect(true);
            }
            return Ok("Email sent");
        }


    }
}
