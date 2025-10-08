#!/usr/bin/env node

/**
 * Test script for Ollama integration
 * Run with: node test-ollama.js
 */

const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b';

async function testOllamaConnection() {
    console.log('🧠 Testing Ollama Integration...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Ollama health...');
        const healthResponse = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
            timeout: 5000
        });

        if (healthResponse.data && healthResponse.data.models) {
            console.log('✅ Ollama is running!');
            console.log(`📊 Available models: ${healthResponse.data.models.length}`);
            healthResponse.data.models.forEach(model => {
                console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
            });
        } else {
            console.log('❌ Ollama is running but no models found');
        }

        // Test 2: Model Availability
        console.log('\n2️⃣ Checking default model...');
        const modelExists = healthResponse.data.models.some(model =>
            model.name === DEFAULT_MODEL || model.name.includes(DEFAULT_MODEL.split(':')[0])
        );

        if (modelExists) {
            console.log(`✅ Default model ${DEFAULT_MODEL} is available`);
        } else {
            console.log(`❌ Default model ${DEFAULT_MODEL} not found`);
            console.log('💡 Run: ollama pull llama3.1:8b');
        }

        // Test 3: Simple Generation
        console.log('\n3️⃣ Testing AI generation...');
        const testPrompt = "Generate a simple Italian restaurant menu item with name, description, and price. Format as JSON.";

        const generateResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: DEFAULT_MODEL,
            prompt: testPrompt,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 200
            }
        }, {
            timeout: 30000
        });

        if (generateResponse.data && generateResponse.data.response) {
            console.log('✅ AI generation working!');
            console.log('📝 Sample response:');
            console.log(generateResponse.data.response.substring(0, 200) + '...');
        } else {
            console.log('❌ AI generation failed');
        }

        // Test 4: Menu Generation
        console.log('\n4️⃣ Testing menu generation...');
        const menuPrompt = `You are a restaurant consultant. Generate a simple menu item for an Italian restaurant:

{
  "name": "Item Name",
  "description": "Description here",
  "price": 12.99,
  "category": "Appetizers",
  "emoji": "🍽️"
}

Make it authentic and appealing.`;

        const menuResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: DEFAULT_MODEL,
            prompt: menuPrompt,
            stream: false,
            options: {
                temperature: 0.8,
                num_predict: 150
            }
        }, {
            timeout: 30000
        });

        if (menuResponse.data && menuResponse.data.response) {
            console.log('✅ Menu generation working!');
            console.log('🍽️ Generated menu item:');
            console.log(menuResponse.data.response);
        } else {
            console.log('❌ Menu generation failed');
        }

        console.log('\n🎉 Ollama integration test completed successfully!');
        console.log('🚀 Your Scandish AI Assistant is ready to use!');

    } catch (error) {
        console.error('\n❌ Ollama integration test failed:');

        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection refused - Ollama is not running');
            console.error('💡 Start Ollama with: ollama serve');
            console.error('💡 Or use Docker: docker run -d -p 11434:11434 ollama/ollama');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('⏰ Request timed out - Model might be loading');
            console.error('💡 Try again in a few minutes');
        } else if (error.response) {
            console.error(`📡 HTTP ${error.response.status}: ${error.response.statusText}`);
            console.error(`📄 Response: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`🚨 ${error.message}`);
        }

        console.error('\n🔧 Troubleshooting:');
        console.error('1. Ensure Ollama is running: ollama serve');
        console.error('2. Pull a model: ollama pull llama3.1:8b');
        console.error('3. Check port 11434 is available');
        console.error('4. Verify firewall settings');

        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testOllamaConnection();
}

module.exports = { testOllamaConnection };

