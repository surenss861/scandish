/**
 * Test script for VibeCoder endpoint
 * Run with: node test-vibe-coder.js
 */

require('dotenv').config();

async function testVibeCoder() {
    const apiUrl = 'http://localhost:4000';

    console.log('🧪 Testing VibeCoder endpoint...\n');

    // Test 1: Check if OpenAI key is configured
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not found in .env');
        console.log('Please add your OpenAI API key to backend/.env:\n');
        console.log('OPENAI_API_KEY=sk-...\n');
        return;
    }
    console.log('✅ OpenAI API key found');

    // Test 2: Check if server is running
    try {
        const healthCheck = await fetch(`${apiUrl}/health`);
        if (healthCheck.ok) {
            console.log('✅ Backend server is running on port 4000\n');
        }
    } catch (error) {
        console.error('❌ Backend server is not running!');
        console.log('Please start it with: npm run dev\n');
        return;
    }

    // Test 3: Test the VibeCoder endpoint
    console.log('📝 Sending test prompt to VibeCoder...');
    console.log('Prompt: "Create elegant menu item hover effects"\n');

    try {
        const response = await fetch(`${apiUrl}/api/ai/vibe-coder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: 'Create elegant menu item hover effects',
                language: 'css',
                context: 'Restaurant menu styling'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ VibeCoder endpoint working!\n');
            console.log('📦 Generated Code:');
            console.log('─'.repeat(60));
            console.log(data.code);
            console.log('─'.repeat(60));
            console.log(`\n🤖 Provider: ${data.provider}`);
            console.log(`📝 Language: ${data.language}\n`);
            console.log('🎉 Menu AI Assistant is working correctly!');
        } else {
            console.error('❌ VibeCoder returned error:', data.error);
        }

    } catch (error) {
        console.error('❌ Error calling VibeCoder:', error.message);

        if (error.message.includes('fetch')) {
            console.log('\nMake sure the backend is running on port 4000');
        }
    }
}

// Run the test
testVibeCoder().catch(console.error);

