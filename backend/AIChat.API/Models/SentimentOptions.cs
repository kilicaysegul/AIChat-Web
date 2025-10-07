namespace AIChat.API.Models;

public class SentimentOptions
{
    public string BaseUrl { get; set; } = "https://hallosf1-aichat.hf.space";

    public string? BearerToken { get; set; }

    public bool FailSafeNeutral { get; set; } = true;

    public int TimeoutSeconds { get; set; } = 20;
}