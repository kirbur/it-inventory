using backend_api.Helpers;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MimeKit;
using System;

namespace backend_api.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class JobController : ControllerBase
    {
        public enum ValidJob
        {
            CostBreakdown,
            LowResource,
        }

        private readonly EmailSettings _emailSettings;

        public JobController(IOptions<EmailSettings> EmailSettings)
        {
            _emailSettings = EmailSettings.Value;
        }

        // Authorize the job with a shared secret.
        [HttpGet]
        [Route("{job}")]
        public IActionResult SendCostBreakdownEmail([FromRoute] ValidJob job, [FromHeader] string token)
        {
            // check the token
            if (token == _emailSettings.Secret)
            {
                return Ok();
            }
            else
            {
                return BadRequest(token);
            }

            // List of people to send the email to.
            // TODO: List of emails is going to be different for the jobs
            InternetAddressList emails = new InternetAddressList();
            emails.Add(new MailboxAddress("John Doe", "john.doe@cqlcorp.com"));
            emails.Add(new MailboxAddress("Michael Smith", "michael.smith@cqlcorp.com"));

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
