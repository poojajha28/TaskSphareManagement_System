// File: src/utils/reward.js

export function calculateRewardPoints(task) {
  let basePoints = 10;
  
  // Priority multiplier
  const priorityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2
  };
  
  // Estimated hours bonus
  const hoursBonus = task.estimatedHours ? Math.floor(task.estimatedHours / 2) * 5 : 0;
  
  // On-time completion bonus
  let timeBonus = 0;
  if (task.dueDate && task.completedAt) {
    const dueDate = new Date(task.dueDate.toDate());
    const completedDate = new Date(task.completedAt.toDate());
    if (completedDate <= dueDate) {
      timeBonus = 15; // Bonus for completing on time
    }
  }
  
  // Calculate total points
  const totalPoints = Math.floor(
    (basePoints + hoursBonus) * priorityMultiplier[task.priority] + timeBonus
  );
  
  return Math.max(totalPoints, 5); // Minimum 5 points
}

export function calculateUserRating(tasksCompleted, averageCompletionTime) {
  // Base rating on number of tasks completed
  let rating = Math.min(5, Math.floor(tasksCompleted / 10) + 1);
  
  // Adjust based on average completion time (if available)
  if (averageCompletionTime) {
    // Add bonus for consistently fast completion
    if (averageCompletionTime < 0.8) { // 80% of estimated time
      rating = Math.min(5, rating + 0.5);
    }
  }
  
  return Math.round(rating * 10) / 10; // Round to 1 decimal place
}