using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NutriFlow.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<APIContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<User>(options =>
{
  options.User.RequireUniqueEmail = true;
  options.Password.RequiredLength = 8;
  options.Password.RequireDigit = true;
  options.Password.RequireUppercase = true;
  options.Password.RequireNonAlphanumeric = false;
})
  .AddEntityFrameworkStores<APIContext>()
  .AddSignInManager()
  .AddDefaultTokenProviders();

//Cookies
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
  .AddCookie(IdentityConstants.ApplicationScheme, options =>
  {
    options.Cookie.Name = "nutriflow_auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
  });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
