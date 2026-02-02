using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.X509Certificates;


namespace NutriFlow.Api.Data
{

  public class User : Microsoft.AspNetCore.Identity.IdentityUser
  {

  }
  public class APIContext : IdentityDbContext<User>
  {
    public APIContext(DbContextOptions<APIContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
    }
  }
}
