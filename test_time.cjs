const classData = { start_time: '12:25:00', date: '2026-10-02' }; // For past
// For today, it's just classData.start_time
const now = new Date();
const [h, m, s] = classData.start_time.split(':').map(Number);
const classStart = new Date();
classStart.setHours(h, m, s, 0);

const diffMins = (now - classStart) / (1000 * 60);
console.log(diffMins);
