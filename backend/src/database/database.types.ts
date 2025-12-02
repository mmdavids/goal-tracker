// Database entity interfaces for better-sqlite3 query results

export interface DbGoalType {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  created_at: string;
  goal_count: number;
}

export interface DbGoal {
  id: number;
  goal_type_id: number | null;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  target_date: string | null;
  quarter: string | null;
  year: number | null;
  emoji: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deleted_at: string | null;
  goal_type_name?: string;
  goal_type_color?: string;
  goal_type_icon?: string;
  update_count?: number;
  image_count?: number;
}

export interface DbProgressUpdate {
  id: number;
  goal_id: number;
  title: string;
  notes: string | null;
  progress_delta: number;
  created_at: string;
  date_achieved: string | null;
  image_count?: number;
}

export interface DbImage {
  id: number;
  progress_update_id: number;
  filename: string;
  original_data: Buffer | null;
  thumbnail_data: Buffer | null;
  mime_type: string;
  caption: string | null;
  created_at: string;
}

export interface DbMilestone {
  id: number;
  goal_id: number;
  title: string;
  threshold: number;
  achieved: number; // SQLite boolean (0 or 1)
  achieved_at: string | null;
}

export interface DbTag {
  id: number;
  name: string;
  color: string;
  goal_count?: number;
}

export interface DbTableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}
