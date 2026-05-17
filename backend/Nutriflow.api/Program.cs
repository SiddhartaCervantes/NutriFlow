using Supabase;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

// 1. Configurar CORS
builder.Services.AddCors(options => {
    options.AddPolicy(name: myAllowSpecificOrigins,
        policy => policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod());
});

// 2. Activar Controladores y configurar JSON para evitar errores de metadatos
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Inyectar Supabase
builder.Services.AddScoped(provider => 
    new Supabase.Client(
        builder.Configuration["Supabase:Url"]!, 
        builder.Configuration["Supabase:Key"]!, 
        new SupabaseOptions { AutoRefreshToken = true }));

var app = builder.Build();

// 4. Activar Middlewares
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors(myAllowSpecificOrigins);
app.MapControllers();

app.Run();