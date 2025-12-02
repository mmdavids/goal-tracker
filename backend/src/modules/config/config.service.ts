import { Injectable } from '@nestjs/common';
import { join, dirname, sep, resolve } from 'path';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { homedir } from 'os';

interface Config {
  databasePath: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
}

@Injectable()
export class ConfigService {
  private configPath = join(process.cwd(), 'config.json');

  getDatabasePath() {
    const config = this.readConfig();
    const currentPath = this.resolveCurrentPath(config.databasePath);
    const defaultPath = this.getDefaultDatabasePath();

    return {
      current: currentPath,
      configured: config.databasePath || '',
      default: defaultPath,
      requiresRestart: config.databasePath !== '' && currentPath !== config.databasePath,
    };
  }

  updateDatabasePath(path: string) {
    const config = this.readConfig();
    config.databasePath = path;
    this.writeConfig(config);

    return {
      success: true,
      message: 'Database path updated. Please restart the backend for changes to take effect.',
      path: path || this.getDefaultDatabasePath(),
    };
  }

  private readConfig(): Config {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to read config:', error);
    }
    return { databasePath: '' };
  }

  private writeConfig(config: Config): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write config:', error);
      throw error;
    }
  }

  private resolveCurrentPath(configuredPath: string): string {
    // Same logic as DatabaseService.getDbPath()
    if (process.env.DATABASE_PATH) {
      return process.env.DATABASE_PATH;
    }

    if (configuredPath && configuredPath.trim()) {
      return configuredPath;
    }

    return this.getDefaultDatabasePath();
  }

  private getDefaultDatabasePath(): string {
    const homeDir = homedir();
    const appDataDir = join(homeDir, '.goal-tracker');
    return join(appDataDir, 'database.sqlite');
  }

  browseDirectory(path?: string) {
    try {
      // If no path provided, start at home directory
      const targetPath = path ? resolve(path) : homedir();

      // Security check: make sure path exists and is accessible
      if (!existsSync(targetPath)) {
        return {
          error: 'Path does not exist',
          currentPath: homedir(),
          parentPath: null,
          entries: [],
        };
      }

      const stat = statSync(targetPath);
      if (!stat.isDirectory()) {
        return {
          error: 'Path is not a directory',
          currentPath: dirname(targetPath),
          parentPath: null,
          entries: [],
        };
      }

      // Get parent directory
      const parentPath = dirname(targetPath);
      const hasParent = parentPath !== targetPath;

      // Read directory contents
      const items = readdirSync(targetPath);
      const entries: DirectoryEntry[] = [];

      for (const item of items) {
        try {
          const itemPath = join(targetPath, item);
          const itemStat = statSync(itemPath);

          // Skip hidden files/folders (starting with .)
          if (item.startsWith('.')) continue;

          entries.push({
            name: item,
            path: itemPath,
            isDirectory: itemStat.isDirectory(),
            isFile: itemStat.isFile(),
          });
        } catch (err) {
          // Skip items we can't access
          continue;
        }
      }

      // Sort: directories first, then files, alphabetically
      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return {
        currentPath: targetPath,
        parentPath: hasParent ? parentPath : null,
        entries,
      };
    } catch (error) {
      return {
        error: error.message || 'Failed to browse directory',
        currentPath: homedir(),
        parentPath: null,
        entries: [],
      };
    }
  }
}
