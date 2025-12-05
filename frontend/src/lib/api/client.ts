import { env } from '$env/dynamic/public';

const API_URL = env.PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GoalType {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  goal_count?: number;
}

export interface Goal {
  id: number;
  goal_type_id?: number;
  goal_type_name?: string;
  goal_type_color?: string;
  goal_type_icon?: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress: number;
  target_date?: string;
  quarter?: string;
  year?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  update_count: number;
  image_count: number;
  tags?: Tag[];
  milestones?: Milestone[];
}

export interface ProgressUpdate {
  id: number;
  goal_id: number;
  title: string;
  notes?: string;
  progress_delta: number;
  created_at: string;
  date_achieved?: string;
  image_count: number;
  images?: Image[];
}

export interface Image {
  id: number;
  progress_update_id: number;
  filename: string;
  filepath: string;
  caption?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  goal_count?: number;
}

export interface Milestone {
  id: number;
  goal_id: number;
  title: string;
  threshold: number;
  achieved: boolean;
  achieved_at?: string;
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Goals API
export const goalsAPI = {
  async getAll(status?: string): Promise<Goal[]> {
    const query = status ? `?status=${status}` : '';
    return fetchAPI(`/goals${query}`);
  },

  async getOne(id: number): Promise<Goal> {
    return fetchAPI(`/goals/${id}`);
  },

  async create(data: Partial<Goal>): Promise<Goal> {
    return fetchAPI('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Goal>): Promise<Goal> {
    return fetchAPI(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updateProgress(id: number, progress: number): Promise<Goal> {
    return fetchAPI(`/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchAPI(`/goals/${id}`, { method: 'DELETE' });
  },

  async getDeleted(): Promise<Goal[]> {
    return fetchAPI('/goals/trash/all');
  },

  async restore(id: number): Promise<Goal> {
    return fetchAPI(`/goals/${id}/restore`, { method: 'PATCH' });
  },

  async permanentDelete(id: number): Promise<void> {
    return fetchAPI(`/goals/${id}/permanent`, { method: 'DELETE' });
  },

  async archive(id: number): Promise<Goal> {
    return fetchAPI(`/goals/${id}/archive`, { method: 'PATCH' });
  },

  async getStats() {
    return fetchAPI('/goals/stats');
  },

  async exportToMarkdown(goalIds: number[]): Promise<Blob> {
    const response = await fetch(`${API_URL}/goals/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goalIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to export goals');
    }

    return response.blob();
  },

  async exportToZip(goalIds: number[]): Promise<Blob> {
    const response = await fetch(`${API_URL}/goals/export-zip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goalIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to export goals as zip');
    }

    return response.blob();
  },
};

// Progress API
export const progressAPI = {
  async getAll(goalId: number): Promise<ProgressUpdate[]> {
    return fetchAPI(`/goals/${goalId}/progress`);
  },

  async create(goalId: number, data: Partial<ProgressUpdate>): Promise<ProgressUpdate> {
    return fetchAPI(`/goals/${goalId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<ProgressUpdate>): Promise<ProgressUpdate> {
    return fetchAPI(`/progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchAPI(`/progress/${id}`, { method: 'DELETE' });
  },

  async move(id: number, goalId: number): Promise<ProgressUpdate> {
    return fetchAPI(`/progress/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ goalId }),
    });
  },
};

// Images API
export const imagesAPI = {
  async upload(progressUpdateId: number, files: File[], captions?: string[]): Promise<Image[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (captions) {
      captions.forEach((caption) => formData.append('captions', caption));
    }

    const response = await fetch(`${API_URL}/progress/${progressUpdateId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    return response.json();
  },

  getUrl(filename: string, thumbnail = false): string {
    const path = thumbnail ? `/images/${filename}/thumbnail` : `/images/${filename}`;
    return `${API_URL}${path}`;
  },

  async delete(id: number): Promise<void> {
    return fetchAPI(`/images/${id}`, { method: 'DELETE' });
  },
};

// Tags API
export const tagsAPI = {
  async getAll(): Promise<Tag[]> {
    return fetchAPI('/tags');
  },

  async create(data: Partial<Tag>): Promise<Tag> {
    return fetchAPI('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addToGoal(goalId: number, tagId: number): Promise<void> {
    return fetchAPI(`/tags/${tagId}/goals/${goalId}`, { method: 'POST' });
  },

  async removeFromGoal(goalId: number, tagId: number): Promise<void> {
    return fetchAPI(`/tags/${tagId}/goals/${goalId}`, { method: 'DELETE' });
  },

  async delete(id: number): Promise<void> {
    return fetchAPI(`/tags/${id}`, { method: 'DELETE' });
  },
};

// Goal Types API
export const goalTypesAPI = {
  async getAll(): Promise<GoalType[]> {
    return fetchAPI('/goal-types');
  },

  async getOne(id: number): Promise<GoalType> {
    return fetchAPI(`/goal-types/${id}`);
  },

  async create(data: Partial<GoalType>): Promise<GoalType> {
    return fetchAPI('/goal-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<GoalType>): Promise<GoalType> {
    return fetchAPI(`/goal-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchAPI(`/goal-types/${id}`, { method: 'DELETE' });
  },
};

// Config API
export const configAPI = {
  async getDatabasePath(): Promise<{
    current: string;
    configured: string;
    default: string;
    requiresRestart: boolean;
  }> {
    return fetchAPI('/config/database-path');
  },

  async updateDatabasePath(path: string): Promise<{
    success: boolean;
    message: string;
    path: string;
  }> {
    return fetchAPI('/config/database-path', {
      method: 'PUT',
      body: JSON.stringify({ path }),
    });
  },

  async browseDirectory(path?: string): Promise<{
    currentPath: string;
    parentPath: string | null;
    entries: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      isFile: boolean;
    }>;
    error?: string;
  }> {
    const params = path ? `?path=${encodeURIComponent(path)}` : '';
    return fetchAPI(`/config/browse-directory${params}`);
  },
};
