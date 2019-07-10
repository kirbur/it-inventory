using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend_api.Models
{
    public partial class AuthIdserver
    {
        // constuctor 
        public AuthIdserver( Guid pActiveDirectoryId, string pRefreshToken, bool pIsAdmin)
        {
            ActiveDirectoryId = pActiveDirectoryId;
            RefreshToken = pRefreshToken;
            IsAdmin = pIsAdmin;
        }
        public AuthIdserver() { }

        [Key]
        public int AuthorizationSimpleId { get; set; }
        public Guid ActiveDirectoryId { get; set; }
        public string RefreshToken { get; set; }
        public bool IsAdmin { get; set; }
    }
}
