namespace backend_api.Helpers
{
    public class EmailSettings
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string SMTP { get; set; }
        public int Port { get; set; }
        public EmailRecipient[] CostBreakdownEmailAddresses { get; set; }
        public EmailRecipient[] LowResourcesEmailAddresses { get; set; }
    }

    public class EmailRecipient
    {
        public string name { get; set; }
        public string address { get; set; }
    }
}
