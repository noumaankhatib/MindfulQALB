/**
 * Fetch Cal.com Event Types
 * 
 * Usage:
 *   node scripts/fetch-calcom-events.js YOUR_API_KEY
 * 
 * Example:
 *   node scripts/fetch-calcom-events.js cal_live_abc123xyz
 */

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('\n❌ Please provide your Cal.com API key\n');
  console.log('Usage: node scripts/fetch-calcom-events.js YOUR_API_KEY');
  console.log('Example: node scripts/fetch-calcom-events.js cal_live_abc123xyz\n');
  process.exit(1);
}

async function fetchEventTypes() {
  try {
    console.log('\n📅 Fetching Cal.com Event Types...\n');
    
    // Cal.com uses apiKey as query parameter, not Bearer token
    const response = await fetch(`https://api.cal.com/v1/event-types?apiKey=${apiKey}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Error:', response.status, error);
      return;
    }

    const data = await response.json();
    
    if (!data.event_types || data.event_types.length === 0) {
      console.log('⚠️  No event types found. Create some in Cal.com first.\n');
      return;
    }

    console.log('✅ Found', data.event_types.length, 'event type(s):\n');
    console.log('─'.repeat(60));
    
    const eventMap = {};
    
    data.event_types.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Duration: ${event.length} minutes`);
      console.log('');
      
      // Build suggested key based on slug
      eventMap[event.slug] = String(event.id);
    });

    console.log('─'.repeat(60));
    console.log('\n📋 CALCOM_EVENT_TYPE_IDS for Vercel:\n');
    console.log(JSON.stringify(eventMap));
    console.log('\n');
    
    console.log('💡 Suggested mapping format for your sessions:');
    console.log('   Copy the IDs above and map them like this:\n');
    console.log('   {');
    console.log('     "free-video": "EVENT_ID_HERE",');
    console.log('     "individual-chat": "EVENT_ID_HERE",');
    console.log('     "individual-audio": "EVENT_ID_HERE",');
    console.log('     "individual-video": "EVENT_ID_HERE",');
    console.log('     "couples-audio": "EVENT_ID_HERE",');
    console.log('     "couples-video": "EVENT_ID_HERE",');
    console.log('     "family-audio": "EVENT_ID_HERE",');
    console.log('     "family-video": "EVENT_ID_HERE"');
    console.log('   }\n');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fetchEventTypes();
