-- Select all milestones
SELECT * FROM milestones;

-- Select milestones with goal information
SELECT
  m.id,
  m.goal_id,
  g.title as goal_title,
  m.title as milestone_title,
  m.threshold,
  m.achieved,
  m.achieved_at
FROM milestones m
JOIN goals g ON m.goal_id = g.id
ORDER BY g.title, m.threshold;

-- Select only achieved milestones
SELECT
  m.id,
  m.goal_id,
  g.title as goal_title,
  m.title as milestone_title,
  m.threshold,
  m.achieved_at
FROM milestones m
JOIN goals g ON m.goal_id = g.id
WHERE m.achieved = 1
ORDER BY m.achieved_at DESC;

-- Select unachieved milestones
SELECT
  m.id,
  m.goal_id,
  g.title as goal_title,
  m.title as milestone_title,
  m.threshold,
  g.progress as current_progress
FROM milestones m
JOIN goals g ON m.goal_id = g.id
LEFT JOIN progress_updates pu ON g.id = pu.goal_id
WHERE m.achieved = 0
GROUP BY m.id
ORDER BY g.title, m.threshold;

-- Select milestones for a specific goal (replace :goal_id with actual ID)
SELECT
  id,
  title,
  threshold,
  achieved,
  achieved_at
FROM milestones
WHERE goal_id = :goal_id
ORDER BY threshold;

-- Count milestones by goal
SELECT
  g.id as goal_id,
  g.title as goal_title,
  COUNT(m.id) as total_milestones,
  SUM(CASE WHEN m.achieved = 1 THEN 1 ELSE 0 END) as achieved_count,
  SUM(CASE WHEN m.achieved = 0 THEN 1 ELSE 0 END) as pending_count
FROM goals g
LEFT JOIN milestones m ON g.id = m.goal_id
GROUP BY g.id
ORDER BY g.title;

-- Select milestones close to being achieved (within 10% of threshold)
SELECT
  m.id,
  m.goal_id,
  g.title as goal_title,
  m.title as milestone_title,
  m.threshold,
  COALESCE(SUM(pu.progress_delta), 0) as current_progress,
  (m.threshold - COALESCE(SUM(pu.progress_delta), 0)) as progress_needed
FROM milestones m
JOIN goals g ON m.goal_id = g.id
LEFT JOIN progress_updates pu ON g.id = pu.goal_id
WHERE m.achieved = 0
  AND g.deleted_at IS NULL
GROUP BY m.id
HAVING current_progress >= (m.threshold - 10)
  AND current_progress < m.threshold
ORDER BY progress_needed ASC;
