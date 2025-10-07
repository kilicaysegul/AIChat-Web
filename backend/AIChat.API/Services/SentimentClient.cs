using System.Net.Http.Headers;
using System.Text.Json;
using AIChat.API.Models;
using Microsoft.Extensions.Options;

namespace AIChat.API.Services;

public class SentimentClient: ISentimentClient
{
    private readonly HttpClient _http;
    private readonly SentimentOptions _opt;
    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public SentimentClient(HttpClient http, IOptions<SentimentOptions> opt)
    {
        _http = http;
        _opt = opt.Value;
        
        if (string.IsNullOrWhiteSpace(_opt.BaseUrl))
            throw new InvalidOperationException("Sentiment:BaseUrl missing (e.g. https://<space>.hf.space)");

        _http.BaseAddress = new Uri(_opt.BaseUrl.TrimEnd('/'));
        _http.Timeout = TimeSpan.FromSeconds(Math.Max(5, _opt.TimeoutSeconds));
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        if (!string.IsNullOrWhiteSpace(_opt.BearerToken))
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _opt.BearerToken);
        }
    }
    public async Task<string> AnalyzeAsync(string text)
    {
        text = (text ?? "").Trim();
        if (string.IsNullOrEmpty(text))
            return "neutral";
        
        var fastApi = await TryFastApiAsync(text);
        if (fastApi.success) return fastApi.label;

        // 2) Gradio /api/analyze  { data: [ text ] }
        var gradioApi = await TryGradioApiAsync("/api/analyze", text);
        if (gradioApi.success) return gradioApi.label;

        // 3) Gradio /run/predict  { data: [ text ] }
        var gradioPredict = await TryGradioApiAsync("/run/predict", text);
        if (gradioPredict.success) return gradioPredict.label;

        // Fail-safe
        return _opt.FailSafeNeutral ? "neutral" : throw new Exception("Sentiment service unavailable");
    }
    
    private static string Normalize(string? raw)
    {
        var l = (raw ?? "neutral").ToLowerInvariant();
        if (l.Contains("pos") || l.Contains("olumlu")) return "positive";
        if (l.Contains("neg") || l.Contains("olumsuz")) return "negative";
        return "neutral";
    }

    private async Task<(bool success, string label)> TryFastApiAsync(string text)
    {
        try
        {
            var resp = await _http.PostAsJsonAsync("/api/analyze", new { text });
            if (!resp.IsSuccessStatusCode) return (false, "neutral");

            var body = await resp.Content.ReadFromJsonAsync<SentimentResponse>(_jsonOpts) 
                       ?? new SentimentResponse();
            return (true, Normalize(body.Label));
        }
        catch { return (false, "neutral"); }
    }

    private async Task<(bool success, string label)> TryGradioApiAsync(string path, string text)
    {
        try
        {
            var resp = await _http.PostAsJsonAsync(path, new { data = new[] { text } });
            if (!resp.IsSuccessStatusCode) return (false, "neutral");
            
            using var s = await resp.Content.ReadAsStreamAsync();
            var json = await JsonDocument.ParseAsync(s);

            if (json.RootElement.TryGetProperty("data", out var dataEl)
                && dataEl.ValueKind == JsonValueKind.Array
                && dataEl.GetArrayLength() > 0)
            {
                var raw = dataEl[0].GetString();
                return (true, Normalize(raw));
            }
            return (false, "neutral");
        }
        catch { return (false, "neutral"); }
    }
}