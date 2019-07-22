using backend_api.Helpers;
using backend_api.Models;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
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

        // Helper for displaying calculated costs in table rows.
        public class CalculatedCost
        {
            public string Name { get; set; }
            public decimal Cost { get; set; }
        }

        // Helper for creating sections in the email body.
        public class EmailBodySection
        {
            public string Name { get; set; }
            public string Data { get; set; }
            public string Note { get; set; }
        }

        private readonly EmailSettings _emailSettings;
        private readonly JobSettings _jobSettings;

        public JobController(IOptions<EmailSettings> EmailSettings, IOptions<JobSettings> JobSettings, ITInventoryDBContext context)
            : base(context)
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

                var receiverEmails = new InternetAddressList();
                var emailBodySections = new EmailBodySection[] { };

                // Construct the message based on the job requested.
                if (job == ValidJob.CostBreakdown)
                {
                    // TODO: Add the actual emails.
                    receiverEmails.Add(new MailboxAddress("Charles Kornoelje", "charles.kornoelje@cqlcorp.com"));

                    // Format the email subject.
                    string date = DateTime.UtcNow.Date.ToString("d");
                    message.Subject = $"CQL IT Inventory Cost Breakdown: {date}";

                    // Update section data.
                    emailBodySections = new EmailBodySection[]
                    {
                        new EmailBodySection()
                        {
                            Name = "Weekly Cost Breakdown",
                            Data = WeeklyCostHtml(),
                            Note = "This is everything that has been bought or renewed within the last seven days.",
                        },
                        new EmailBodySection()
                        {
                            Name = "Overall Program Cost Breakdown",
                            Data = OverallProgramCostHtml(),
                            Note = "This is the projected cost of all the recurring program and plugin costs.",
                        },
                    };
                }
                else if (job == ValidJob.LowResource)
                {
                    List<LicenseResource> lowResources = LowResources();
                    int count = lowResources.Count();
                    if (count > 0)
                    {
                        // TODO: Add acutal emails.
                        receiverEmails.Add(new MailboxAddress("Charles Kornoelje", "charles.kornoelje@cqlcorp.com"));

                        // Format the email subject.
                        message.Subject = $"CQL IT Inventory Low Resource{(count > 1 ? "s" : "")}: {ResourceNameSubjectString(lowResources)}";

                        // Add the data for the section.
                        emailBodySections = new EmailBodySection[]
                        {
                            new EmailBodySection()
                            {
                                Name = "Low Resources",
                                Data = LowResourceHtml(lowResources),
                                Note = "These are the licenses that are 80% or more in use."
                            }
                        };
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

                // Add the receiver emails. 
                message.To.AddRange(receiverEmails);

                var bodyBuilder = new BodyBuilder();

                // Import the email template.
                using (StreamReader SourceReader = System.IO.File.OpenText(".\\helpers\\email-template-add-parts.html"))
                {
                    bodyBuilder.HtmlBody = SourceReader.ReadToEnd();
                }

                // Replace the text-tags on the email with formatted data and html.
                bodyBuilder.HtmlBody = bodyBuilder.HtmlBody.Replace("<<sections>>", SectionHtml(emailBodySections));
                bodyBuilder.HtmlBody = bodyBuilder.HtmlBody.Replace("<<year>>", $"{DateTime.Now.Year}");
                bodyBuilder.HtmlBody = bodyBuilder.HtmlBody.Replace("<<note>>", NotePicker());

                // TODO: update this?
                bodyBuilder.TextBody = "This is some plain text";
                message.Body = bodyBuilder.ToMessageBody();

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

        /* WeeklyCostHtml() will return the weekly costs formatted properly.
         * Return: string with the cost formatted in HTML for the email.
         */
        private string WeeklyCostHtml()
        {
            List<CalculatedCost> weeklyCostList = WeeklyCostCalculator();
            string weeklyCostHtml = "";
            foreach (CalculatedCost wc in weeklyCostList)
            {
                weeklyCostHtml += TableRowHtml($"Last week's {wc.Name} cost: ${Math.Round(wc.Cost, 2)}");
            }
            return weeklyCostHtml;
        }

        /* OverallProgramCostHtml() calculates and formats the recurring cost of programs
         *   and plugins that are not deleted.
         * Returns: Recurring cost for plugins and programs, and the total, formatted in HTML.
         */
        private string OverallProgramCostHtml()
        {
            // Cost breakdown data calculated for the email.
            CostBreakDown costBreakDown = DashboardCostBreakDown();
            decimal totalCost = costBreakDown.CostOfProgramsPerYear + costBreakDown.CostOfPluginsPerYear ?? 0.0m;
            decimal programCost = costBreakDown.CostOfProgramsPerYear ?? 0.0m;
            decimal pluginCost = costBreakDown.CostOfPluginsPerYear ?? 0.0m;

            var calculatedCostItems = new CalculatedCost[]
            {
                new CalculatedCost()
                {
                    Name = "Total cost",
                    Cost = totalCost,
                },
                new CalculatedCost()
                {
                    Name = "Program cost",
                    Cost = programCost,
                },
                new CalculatedCost()
                {
                    Name = "Plugin cost",
                    Cost = pluginCost,
                },
            };

            // Format the data in HTML.
            string costBreakdownHtml = "";
            foreach (CalculatedCost item in calculatedCostItems)
            {
                string rowData = $"{item.Name}: ${Math.Round(item.Cost / 12, 2)}/mo | ${Math.Round(item.Cost, 2)}/yr";
                costBreakdownHtml += TableRowHtml(rowData);
            }

            return costBreakdownHtml;
        }

        /* LowResourceHtml(lowResources) will format the list of low resources.
         * Return: String of low resources in HTML for email.
         */
        private string LowResourceHtml(List<LicenseResource> lowResources)
        {
            string data = "";
            foreach (LicenseResource lr in lowResources)
            {
                data += TableRowHtml($"{lr.Name} is {lr.PercentageInUse * 100}% in use ({lr.CountInUse}/{lr.CountOverall}).");
            }
            return data;
        }

        /* ResourceNameSubjectString(lowResources) returns the names of each low license with a comma if
         *   there are multiple.
         * Return: String formatted for the email subject.
         */
        private string ResourceNameSubjectString(List<LicenseResource> lowResources)
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

        /* SectionHtml(emailSecitons) creates a section in the body of the email
         *   to separate different groupings of data.
         * Return: A string with the sections formatted in HTML.  
         */
        private string SectionHtml(EmailBodySection[] emailSecitons)
        {
            string sectionHtml = "";
            for (int i = 0; i < emailSecitons.Count(); i++)
            {
                sectionHtml += $@"
                    <tr>
				        <td valign=""top"" align=""center"" bgcolor=""#{(i % 2 == 0 ? "1a1a1a" : "3d3d3d")}"" style=""padding:35px 70px 30px;"" class=""em_padd"">
					        <table align=""center"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
						        <tr>
							        <td align=""left"" valign=""top"" style=""font-size:18px; line-height:30px; color:#{(i % 2 == 0 ? "ffae70" : "2eafff")};"">
								        {emailSecitons[i].Name}:
							        </td>
						        </tr>
						        <tr>
							        <td height=""15"" style=""font-size:0px; line-height:0px; height:15px;"">&nbsp;</td>
						        </tr>
						        {emailSecitons[i].Data}
                                <tr>
                                    <td align=""left"" valign=""top"" style=""font-size:12px; line-height:22px; color:#a6a6a6; padding-bottom:12px;"">
                                        {emailSecitons[i].Note}
                                    </td>
                                </tr>
					        </table>
				        </td>
			        </tr>
                ";
            }
            return sectionHtml;
        }

        /* TableRowHtml(rowData) formats the string of data in a table row
         *   in order to be inserted into the HTML.
         * Returns: data formatted in HTML.
         */
        private string TableRowHtml(string rowData)
        {
            return $@"
                <tr>
                    <td align=""left"" valign=""top"" style=""font-size:14px; line-height:22px; color:#FFF; padding-bottom:12px;"">
                        {rowData}
                    </td>
                </tr>
            ";
        }

        /* NotePicker() picks a random note to preface the email.
         * Return: a random string from the list.
         */
        private string NotePicker()
        {
            string[] notes = {
                "Don't forget to smile!",
                "To my favorite CQLite.",
                "I'm just the messenger.",
                "\"Not another one!\"",
                "\"That'll do.\"",
                "Osaka, Japan has 40 municipal mascots.",
                "It's sunny somewhere!",
                "Greetings and salutations.",
                "Howdy partner.",
                "Sent with love.",
                "Hope your day is as great as Mike's laugh.",
                "Just the facts.",
                "From your favorite NextGens.",
                "Blue skies aren't that far away.",
                "Chess Query Language.",
                "Citizens For Quality Of Life.",
                "Can Quack Loudly.",
                "Cabbage Quiz League.",
                "Don't let this sour your day.",
                ":)",
                "\"Hello, it's me.\"",
                "One step closer to Friday.",
                "Let's crunch those numbers.",
                "*excited fist pump*",
                "Yoo-hoo!",
                "Nothing but business.",
                "Give someone a high-five.",
                "Sailed the high tides and the seven CQLs.",
                "CQL you later, alligator.",
                "As far as the eye can CQL.",
                "Long time, no SeeQL.",
            };

            Random rand = new Random();
            int index = rand.Next(notes.Length);
            return notes[index];
        }

        /* WeeklyCostCalculator() calculates the cost of any entity that was purchased or renewed 
         *   within the last seven days.
         * Returns: List of cost for each model type and the total cost.
         * 
         */
        private List<CalculatedCost> WeeklyCostCalculator()
        {
            // Entities paid for in the last week. 
            decimal? lastWeekProgramCost = weeklyCostOfItem<Models.Program>();
            decimal? lastWeekPluginsCost = weeklyCostOfItem<Plugins>();
            decimal? lastWeekServerCost = weeklyCostOfItem<Server>();
            decimal? lastWeekComputerCost = weeklyCostOfItem<Computer>();
            decimal? lastWeekMonitorCost = weeklyCostOfItem<Monitor>();
            decimal? lastWeekPeripheralCost = weeklyCostOfItem<Peripheral>();
            decimal lastWeekTotalCost = (decimal)(lastWeekProgramCost + lastWeekPluginsCost +
                lastWeekServerCost + lastWeekComputerCost + lastWeekMonitorCost + lastWeekPeripheralCost);

            // Add all to the list.
            var weeklyCostList = new List<CalculatedCost>();
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "total",
                Cost = (decimal)lastWeekTotalCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "program",
                Cost = (decimal)lastWeekProgramCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "plugins",
                Cost = (decimal)lastWeekPluginsCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "server",
                Cost = (decimal)lastWeekServerCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "computer",
                Cost = (decimal)lastWeekComputerCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "monitor",
                Cost = (decimal)lastWeekMonitorCost,
            });
            weeklyCostList.Add(new CalculatedCost()
            {
                Name = "peripheral",
                Cost = (decimal)lastWeekPeripheralCost,
            });

            return weeklyCostList;
        }

        /* weeklyCostOfItem<T>() calculates the past week's cost for an item. 
         *   If an item was bought within the past week, then it will be added.
         *   If an item was renewed in the last week, it will be added and CostPerYear normalized
         *   to the length of the renewal period (i.e. if something is renewed every month, the
         *   cost the past week will be CostPerYear/12)
         * Returns: deciaml? which is the past week's cost of the item.
         */
        private decimal? weeklyCostOfItem<T>()
            where T : class, IPurchaseRenewal, ISoftDeletable
        {
            DateTime today = DateTime.Today;
            DateTime lastWeek = today.AddDays(-7);
            decimal? costPrograms = _context.Set<T>()
                    // Don't add any costs of deleted things.
                    .Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        // Find the previous renewal date, and also select vars needed in future.
                        // In order to perform the date comparisons below, if the RenewalDate or MonthsPerRenewal is null,
                        //   then a super old date is passed to give the same effect as null.
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

        /* LowResources() calculates all of the licenses that are at an 80% or greater use rate.
         * Return: List of licenses soon to run out.
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
    }
}
