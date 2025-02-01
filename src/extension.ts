import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Activates the extension. This is the entry point for the extension.
 * Registers commands, providers, and event listeners.
 */
export function activate(context: vscode.ExtensionContext) {
  // Clear any existing user overrides from previous sessions
  const userOverrides = context.globalState;
  userOverrides.keys().forEach(key => userOverrides.update(key, undefined));

  // Initialize the unused file provider and decoration provider
  const unusedFileProvider = new UnusedFileProvider(userOverrides, context);
  vscode.window.registerTreeDataProvider('unusedFiles', unusedFileProvider);

  const unusedFileDecorationProvider = new UnusedFileDecorationProvider(userOverrides);
  context.subscriptions.push(vscode.window.registerFileDecorationProvider(unusedFileDecorationProvider));

  // Register the command to scan for unused files
  const refreshCommand = vscode.commands.registerCommand('extension.highlightUnusedFiles', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder is open.');
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;

    // Show a progress bar during the scan
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Scanning for unused files...',
        cancellable: true,
      },
      async (progress, token) => {
        try {
          // Read the configuration file and get all files in the workspace
          const config = await readConfigFile(workspacePath);
          const allFiles = await getAllFiles(workspacePath, config.ignoreFolders, config.ignoreRootFiles);
          const trackedFiles = allFiles.filter(file => config.fileTypes.includes(path.extname(file).toLowerCase()));

          // Process files in batches for better performance
          const batchSize = 100;
          const totalFiles = trackedFiles.length;
          let processedFiles = 0;

          const unusedFiles: string[] = [];

          for (let i = 0; i < totalFiles; i += batchSize) {
            if (token.isCancellationRequested) {
              vscode.window.showInformationMessage('Scan canceled by user.');
              return;
            }

            const batch = trackedFiles.slice(i, i + batchSize);
            const batchUnusedFiles = await findUnusedFiles(batch, workspacePath, userOverrides, token);
            unusedFiles.push(...batchUnusedFiles);

            processedFiles += batch.length;
            progress.report({ increment: (batch.length / totalFiles) * 100, message: `Processed ${processedFiles} of ${totalFiles} files...` });
          }

          // Update the UI with the results
          unusedFileProvider.refresh(unusedFiles);
          unusedFileDecorationProvider.updateUnusedFiles(unusedFiles);
          vscode.window.showInformationMessage(`Scan complete. Found ${unusedFiles.length} unused files.`);
        } catch (error) {
          vscode.window.showErrorMessage('An error occurred while processing files.');
        }
      }
    );
  });

  // Register the command to toggle the status of a file (used/unused)
  const toggleFileStatusCommand = vscode.commands.registerCommand('extension.toggleFileStatus', async (filePath: string) => {
    const isMarkedAsUsed = userOverrides.get<boolean>(filePath, false);
    await userOverrides.update(filePath, !isMarkedAsUsed);

    // Refresh the UI to reflect the updated status
    unusedFileDecorationProvider.updateUnusedFiles(unusedFileProvider.unusedFiles);
    setTimeout(() => {
      unusedFileProvider.refresh(unusedFileProvider.unusedFiles);
      unusedFileDecorationProvider.updateUnusedFiles(unusedFileProvider.unusedFiles);
    }, 800);
  });

  // Register the command to reset the status of a file
  const resetFileStateCommand = vscode.commands.registerCommand('extension.resetFileState', async (filePath: string) => {
    await userOverrides.update(filePath, undefined);
    unusedFileProvider.refresh(unusedFileProvider.unusedFiles);
    unusedFileDecorationProvider.updateUnusedFiles(unusedFileProvider.unusedFiles);
  });

  // Watch for file deletions and update the unused files list
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
  fileWatcher.onDidDelete(async (uri) => {
    const deletedFilePath = uri.fsPath;
    unusedFileProvider.unusedFiles = unusedFileProvider.unusedFiles.filter(file => file !== deletedFilePath);
    unusedFileProvider.refresh(unusedFileProvider.unusedFiles);
    unusedFileDecorationProvider.updateUnusedFiles(unusedFileProvider.unusedFiles);
  });

  // Add all commands and watchers to the context subscriptions
  context.subscriptions.push(refreshCommand, toggleFileStatusCommand, resetFileStateCommand, fileWatcher);
}

/**
 * Provides data for the unused files tree view.
 */
class UnusedFileProvider implements vscode.TreeDataProvider<UnusedFileItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<UnusedFileItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  public unusedFiles: string[] = [];
  private userOverrides: vscode.Memento;
  private context: vscode.ExtensionContext;

  constructor(userOverrides: vscode.Memento, context: vscode.ExtensionContext) {
    this.userOverrides = userOverrides;
    this.context = context;
  }

  /**
   * Refreshes the tree view with the latest list of unused files.
   */
  refresh(unusedFiles: string[]): void {
    this.unusedFiles = unusedFiles;
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Returns the tree item for a given element.
   */
  getTreeItem(element: UnusedFileItem): vscode.TreeItem {
    return element;
  }

  /**
   * Returns the children of the tree view.
   */
  getChildren(): Thenable<UnusedFileItem[]> {
    const filteredUnusedFiles = this.unusedFiles.filter(file => !this.userOverrides.get<boolean>(file, false));
    return Promise.resolve(filteredUnusedFiles.map(file => new UnusedFileItem(file, this.userOverrides.get<boolean>(file, false), this.context)));
  }
}

/**
 * Represents an item in the unused files tree view.
 */
class UnusedFileItem extends vscode.TreeItem {
  constructor(public readonly filePath: string, public readonly isMarkedAsUsed: boolean, context: vscode.ExtensionContext) {
    super(path.basename(filePath), vscode.TreeItemCollapsibleState.None);
    this.resourceUri = vscode.Uri.file(filePath);
    this.contextValue = isMarkedAsUsed ? 'usedFile' : 'unusedFile';
    this.command = {
      command: 'extension.toggleFileStatus',
      title: 'Toggle File Status',
      arguments: [filePath],
    };
    const iconPath = isMarkedAsUsed
      ? vscode.Uri.file(path.join(context.extensionPath, 'resources', 'used.svg'))
      : vscode.Uri.file(path.join(context.extensionPath, 'resources', 'unused.svg'));
    this.iconPath = iconPath;
  }
}

/**
 * Provides file decorations (badges) for unused files in the file explorer.
 */
class UnusedFileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
  private unusedFiles: Set<string> = new Set();

  constructor(private userOverrides: vscode.Memento) {}

  /**
   * Updates the list of unused files and triggers a refresh of the decorations.
   */
  updateUnusedFiles(unusedFiles: string[]): void {
    this.unusedFiles = new Set(unusedFiles);
    this._onDidChangeFileDecorations.fire([...this.unusedFiles].map(file => vscode.Uri.file(file)));
  }

  /**
   * Provides the decoration for a given file URI.
   */
  provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
    if (this.unusedFiles.has(uri.fsPath)) {
      if (this.userOverrides.get<boolean>(uri.fsPath, false)) {
        const username = os.userInfo().username || 'User';
        return {
          badge: '✓',
          tooltip: `Used File (Marked by ${username})`,
          color: new vscode.ThemeColor('gitDecoration.addedResourceForeground'),
        };
      } else {
        return {
          badge: '✗',
          tooltip: 'Unused File',
          color: new vscode.ThemeColor('errorForeground'),
        };
      }
    }
    return null;
  }
}

/**
 * Reads the configuration file for the extension.
 * If the file does not exist, returns the default configuration.
 */
async function readConfigFile(workspacePath: string) {
  const configPath = path.join(workspacePath, '.filescavengerrc');
  const defaultConfig = {
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.less', '.html', '.htm', '.json', '.xml', '.yml', '.yaml', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.bmp', '.ico', '.webp', '.mp4', '.mp3', '.wav', '.ogg', '.pdf', '.md', '.txt', '.csv', '.sql', '.sh', '.bat', '.ps1', '.py', '.rb', '.php', '.java', '.cpp', '.c', '.h', '.go', '.rs', '.swift', '.kt', '.dart', '.lua', '.pl', '.r', '.hs', '.scala', '.clj', '.elm', '.erl', '.ex', '.fs', '.groovy', '.jl', '.nim', '.pde', '.v', '.vb', '.vbs', '.zig'],
    ignoreFolders: ['node_modules', '.git', 'dist', 'build', 'out', 'bin', 'obj', 'vendor', 'logs', 'temp'],
    ignoreRootFiles: ['README.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'webpack.config.js', '.gitignore', '.env', '.env.local', 'docker-compose.yml', 'Makefile', 'Procfile']
  };

  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }

  try {
    const userConfig = JSON.parse(await readFile(configPath, 'utf-8'));
    return { ...defaultConfig, ...userConfig };
  } catch {
    return defaultConfig;
  }
}

/**
 * Recursively retrieves all files in a directory, excluding specified folders and files.
 */
async function getAllFiles(dirPath: string, ignoreFolders: string[] = [], ignoreRootFiles: string[] = []): Promise<string[]> {
  let files: string[] = [];
  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory() && ignoreFolders.includes(item.name)) { continue; }
      if (!item.isDirectory() && ignoreRootFiles.includes(item.name)) { continue; }
      files = files.concat(item.isDirectory() ? await getAllFiles(fullPath, ignoreFolders, ignoreRootFiles) : [fullPath]);
    }
  } catch {}
  return files;
}

/**
 * Determines which files in the provided list are unused.
 */
async function findUnusedFiles(trackedFiles: string[], workspacePath: string, userOverrides: vscode.Memento, token?: vscode.CancellationToken): Promise<string[]> {
  const unusedFiles: string[] = [];

  // Create a map of file names to their full paths for quick lookup
  const fileMap: { [key: string]: string } = {};
  for (const file of trackedFiles) {
    const fileName = path.basename(file);
    fileMap[fileName] = file;
  }

  for (const file of trackedFiles) {
    if (token?.isCancellationRequested) {
      break;
    }

    if (userOverrides.get<boolean>(file, false)) {
      continue;
    }

    let isUsed = false;
    const fileName = path.basename(file);
    const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.'); // Remove file extension

    for (const otherFile of trackedFiles) {
      if (otherFile === file) { continue; }

      try {
        const content = await readFile(otherFile, 'utf-8');

        // Check for exact file name match
        if (content.includes(fileName)) {
          isUsed = true;
          break;
        }

        // Check for partial file name match (without extension)
        if (content.includes(fileNameWithoutExtension)) {
          isUsed = true;
          break;
        }
      } catch {}
    }

    if (!isUsed) {
      unusedFiles.push(file);
    }
  }
  return unusedFiles;
}

/**
 * Deactivates the extension. This is called when the extension is disabled or uninstalled.
 */
export function deactivate() {}