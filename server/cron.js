const cron = require('node-cron');
const { generateBatchSummaries, calculateAvgMoodEmoji } = require('./services/summaryService');

function setupCron(db) {
  // Run at 19:25 every day
  cron.schedule('22 19 * * *', async () => {
    console.log('Running daily summary generation cron...');
    
    try {
      const users = await db.collection('users').find({}).toArray();
      const todayStr = new Date().toISOString().split('T')[0];

      for (const user of users) {
        const userId = user._id.toString();
        
        const entries = await db.collection('entries').find({ userId }).toArray();
        if (entries.length === 0) continue;

        const existingSummaries = await db.collection('summaries').find({ userId }).toArray();
        const existingDates = new Set(existingSummaries.map(s => s.date));

        const missingDaysEntries = {};
        entries.forEach(entry => {
          const date = new Date(entry.createdAt).toISOString().split('T')[0];
          if (date < todayStr && !existingDates.has(date)) {
            if (!missingDaysEntries[date]) missingDaysEntries[date] = [];
            missingDaysEntries[date].push(entry);
          }
        });

        const datesToSummarize = Object.keys(missingDaysEntries);
        if (datesToSummarize.length === 0) continue;

        console.log(`Generating batch summaries for user ${userId} for ${datesToSummarize.length} days`);

        const newSummariesMap = await generateBatchSummaries(missingDaysEntries);

        // 5. Store them
        const summariesToInsert = [];
        for (const date of datesToSummarize) {
          if (newSummariesMap[date]) {
            summariesToInsert.push({
              userId,
              date,
              summary: newSummariesMap[date]
            });
          }
        }

        if (summariesToInsert.length > 0) {
          await db.collection('summaries').insertMany(summariesToInsert);
          console.log(`Inserted ${summariesToInsert.length} new summaries for user ${userId}`);
        }
      }
    } catch (err) {
      console.error('Cron job failed:', err);
    }
  });
}

module.exports = setupCron;