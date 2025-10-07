namespace AIChat.API;

public interface ISentimentClient
{
    Task<string> AnalyzeAsync(string text);
}