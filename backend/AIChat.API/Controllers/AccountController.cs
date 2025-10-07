using AIChat.API.Data;
using AIChat.API.Dtos;
using AIChat.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIChat.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly ApplicationDbContext _context;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    
    public AccountController(ApplicationDbContext context, ITokenService tokenService, SignInManager<AppUser> signInManager, UserManager<AppUser> userManager)
    {
        _context = context;
        _tokenService = tokenService;
        _signInManager = signInManager;
        _userManager = userManager;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserCreate userCreate)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var appUser = new AppUser()
            {
                Email = userCreate.Email,
                UserName = userCreate.Username,
            };
            var createdUser = await _userManager.CreateAsync(appUser, userCreate.Password);
            if (createdUser.Succeeded)
            {
                _context.SaveChanges();
                
                return Ok(new NewUserDto
                {
                    UserName = appUser.UserName,
                    Email = appUser.Email,
                    Token = _tokenService.CreateToken(appUser)
                });
            }
            else 
            {
                return BadRequest(createdUser.Errors);
            }
        }
        catch (Exception ex) 
        { 
            return BadRequest($"Failed to register {ex.Message}");
        }
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto) 
    {
        if (!ModelState.IsValid) 
            return BadRequest(ModelState);

        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.UserName.ToLower());
        if (user == null) return Unauthorized("Invalid Username");
        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded) return Unauthorized("Username not found and/or password incorrect");
        return Ok(new NewUserDto
        {
            UserName = loginDto.UserName,
            Email = user.Email,
            Token= _tokenService.CreateToken(user)
        });
    }
}