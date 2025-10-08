# Ollama AI Setup Guide

This guide will help you set up Ollama with Scandish for advanced AI-powered restaurant assistance.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Install Docker and Docker Compose**
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install docker.io docker-compose
   
   # On macOS
   brew install docker docker-compose
   
   # On Windows
   # Download Docker Desktop from https://docker.com
   ```

2. **Start Ollama with Scandish**
   ```bash
   # Start all services including Ollama
   docker-compose -f docker-compose.ollama.yml up -d
   
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   ```

3. **Pull AI Models**
   ```bash
   # Pull the default model (Llama 3.1 8B)
   docker exec scandish-ollama ollama pull llama3.1:8b
   
   # Pull additional models (optional)
   docker exec scandish-ollama ollama pull llama3.1:70b  # Larger, more capable
   docker exec scandish-ollama ollama pull codellama:7b  # Code-focused
   docker exec scandish-ollama ollama pull mistral:7b    # Alternative model
   ```

### Option 2: Local Installation

1. **Install Ollama**
   ```bash
   # On Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama Service**
   ```bash
   # Start Ollama daemon
   ollama serve
   
   # In another terminal, pull models
   ollama pull llama3.1:8b
   ```

3. **Update Backend Environment**
   ```bash
   # Add to your .env file
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_DEFAULT_MODEL=llama3.1:8b
   ```

## 🧠 Available AI Models

### Recommended Models

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `llama3.1:8b` | 4.7GB | Fast | Good | General purpose, menu generation |
| `llama3.1:70b` | 40GB | Slow | Excellent | Complex branding, detailed analysis |
| `mistral:7b` | 4.1GB | Fast | Good | Alternative general purpose |
| `codellama:7b` | 3.8GB | Fast | Good | Code generation, technical tasks |

### Model Comparison

**For Menu Generation:**
- `llama3.1:8b` - Best balance of speed and quality
- `mistral:7b` - Good alternative with different style

**For Branding & Marketing:**
- `llama3.1:70b` - Best quality for creative tasks
- `llama3.1:8b` - Good for quick iterations

**For Code Generation:**
- `codellama:7b` - Specialized for coding tasks
- `llama3.1:8b` - General purpose with coding abilities

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1:8b

# Optional: GPU Support (if available)
CUDA_VISIBLE_DEVICES=0
```

### Backend Configuration

The backend will automatically:
- Check Ollama health on startup
- Use the configured default model
- Fall back gracefully if Ollama is unavailable

### Frontend Configuration

The frontend will:
- Display AI service status
- Provide helpful error messages
- Gracefully handle offline scenarios

## 🎯 AI Features

### 1. Menu Generation
- **Complete Menu Creation**: Generate full menus for any cuisine type
- **Customization**: Specify preferences, dietary restrictions, price points
- **Quality**: Professional-grade menu items with descriptions and pricing

### 2. Branding Suggestions
- **Color Palettes**: AI-generated color schemes with hex codes
- **Typography**: Font recommendations and combinations
- **Logo Concepts**: Creative logo ideas and directions
- **Brand Identity**: Name suggestions, taglines, personality traits

### 3. Menu Optimization
- **Content Enhancement**: Improve existing menu descriptions
- **Pricing Strategy**: Optimize prices based on market analysis
- **Category Organization**: Better menu structure and flow
- **Allergen Information**: Add comprehensive allergen warnings

### 4. Marketing Copy
- **Social Media**: Instagram, Facebook, Twitter content
- **Website Copy**: Headlines, descriptions, calls-to-action
- **Email Marketing**: Subject lines, newsletters, promotions
- **Print Marketing**: Flyers, business cards, menu covers

### 5. Competitor Analysis
- **Pricing Analysis**: Market positioning and opportunities
- **Content Quality**: Description and naming assessments
- **Strategic Insights**: Competitive advantages and gaps
- **Recommendations**: Actionable improvement suggestions

## 🚀 Usage Examples

### Generate Italian Menu
```javascript
// Frontend API call
const response = await AIAssistantService.generateMenuSuggestions('italian', {
    preferences: 'fine dining, seasonal ingredients, vegetarian options'
});
```

### Get Branding Ideas
```javascript
// Frontend API call
const response = await AIAssistantService.generateBrandingSuggestions(
    'Modern Italian trattoria with farm-to-table ingredients, casual fine dining atmosphere'
);
```

### Optimize Existing Menu
```javascript
// Frontend API call
const response = await AIAssistantService.optimizeMenuContent(menuItems, [
    'improve descriptions',
    'enhance appeal',
    'optimize pricing'
]);
```

## 🔍 Troubleshooting

### Common Issues

**1. Ollama Service Not Starting**
```bash
# Check if port 11434 is available
netstat -tlnp | grep 11434

# Restart Ollama service
docker restart scandish-ollama
# or
sudo systemctl restart ollama
```

**2. Model Not Found**
```bash
# List available models
ollama list

# Pull missing model
ollama pull llama3.1:8b
```

**3. Slow Response Times**
- Use smaller models (8b instead of 70b)
- Ensure adequate RAM (8GB+ recommended)
- Consider GPU acceleration for faster inference

**4. Out of Memory**
```bash
# Check available memory
free -h

# Use smaller model or increase swap
ollama pull mistral:7b  # Smaller alternative
```

### Performance Optimization

**GPU Acceleration (NVIDIA)**
```bash
# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

**Memory Optimization**
```bash
# Set memory limits in docker-compose
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 8G
```

## 📊 Monitoring

### Health Checks
```bash
# Check Ollama health
curl http://localhost:11434/api/tags

# Check backend integration
curl http://localhost:4000/api/ollama/health
```

### Logs
```bash
# View Ollama logs
docker logs scandish-ollama

# View backend logs
docker logs scandish-backend
```

## 🔒 Security Considerations

1. **Network Security**: Ollama is only accessible from localhost by default
2. **Model Safety**: All models are vetted and safe for restaurant use
3. **Data Privacy**: No data is sent to external services
4. **Authentication**: All AI endpoints require user authentication

## 🎉 Success!

Once set up, you'll have access to:

- ✅ **10x Better AI Assistant** with local, powerful models
- ✅ **Menu Generation** for any cuisine type
- ✅ **Branding Suggestions** with professional recommendations
- ✅ **Menu Optimization** with AI-powered improvements
- ✅ **Marketing Copy** for all your promotional needs
- ✅ **Competitor Analysis** for strategic insights

Your Scandish AI Assistant is now ready to revolutionize your restaurant's digital presence! 🚀

