# File Scavenger - VS Code Extension

![search](https://github.com/user-attachments/assets/8ba2c9a7-a152-4a0b-ac3d-95b15d086735)

**File Scavenger** is a powerful VS Code extension designed to help developers identify and manage unused files in their projects. With an intuitive interface and advanced scanning capabilities, File Scavenger ensures your workspace stays clean and efficient.

---

## Table of Contents

1. [Features](#features-)
2. [Installation](#installation-)
   - [Prerequisites](#prerequisites)
   - [Installation Steps](#installation-steps)
3. [Usage](#usage-)
   - [Scan for Unused Files](#1-scan-for-unused-files)
   - [View Unused Files](#2-view-unused-files)
   - [Toggle File Status](#3-toggle-file-status)
   - [Reset File Status](#4-reset-file-status)
   - [Customize Configuration](#5-customize-configuration)
4. [Configuration](#configuration-)
   - [Default Configuration](#default-configuration)
   - [Custom Configuration](#custom-configuration)
5. [Screenshots](#screenshots-)
6. [Contributing](#contributing-)
7. [License](#license-)
8. [Support](#support-)
9. [Credits](#credits-)

---

## Features ✨

- **Scan for Unused Files**: Automatically detect files that are not referenced anywhere in your project.
- **Customizable Configuration**: Define file types, ignored folders, and root files to tailor the scan to your project's needs.
- **Interactive Tree View**: View unused files in a structured tree view for easy navigation.
- **File Status Toggle**: Mark files as used with a single click.
- **File Decorations**: Visual indicators in the file explorer show which files are unused.
- **Batch Processing**: Efficiently scan large projects by processing files in batches.
- **Real-Time Updates**: Automatically update the unused files list when files are deleted.

---

## Installation 🛠️

### Prerequisites
- **Visual Studio Code**: Ensure you have [VS Code](https://code.visualstudio.com/) installed on your machine.
- **Node.js**: (Optional) Required if you plan to customize or contribute to the extension.

### Installation Steps
1. **Open VS Code**:
   - Launch Visual Studio Code on your machine.

2. **Go to Extensions**:
   - Click on the **Extensions** icon in the Activity Bar on the side of the window or press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).

3. **Search for File Scavenger**:
   - In the Extensions view search bar, type **"File Scavenger"**.

4. **Install the Extension**:
   - Click the **Install** button next to the File Scavenger extension.

5. **Reload VS Code**:
   - After installation, click **Reload** to activate the extension.

6. **Verify Installation**:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type **`File Scavenger: Highlight Unused Files`**. If the command appears, the extension is successfully installed.

---

## Usage 🚀

### 1. Scan for Unused Files
- Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
- Type and select **`File Scavenger: Highlight Unused Files`**.
- The extension will scan your workspace and display unused files in the **Unused Files** view.

### 2. View Unused Files
- After the scan, unused files will appear in the **Unused Files** tree view in the Explorer sidebar.
- Click on a file to open it.

### 3. Toggle File Status
- Right-click on a file in the **Unused Files** view or file explorer.
- Select **`Toggle File Status`** to mark it as used or unused.
- Files marked as used will no longer appear in the unused files list.

### 4. Reset File Status
- Right-click on a file in the **Unused Files** view or file explorer.
- Select **`Reset File State`** to clear its status and include it in future scans.

### 5. Customize Configuration
- Create a `.filescavengerrc` file in the root of your workspace to customize the scan settings:

```json
  {
    "fileTypes": [".js", ".ts", ".css", ".html"],
    "ignoreFolders": ["node_modules", "dist"],
    "ignoreRootFiles": ["README.md", "package.json"]
  }
 ```
- If no configuration file is found, the extension will use default settings.

---

## Configuration ⚙️

### Default Configuration:

By default, File Scavenger scans for the following file types and ignores common folders and files:
- File Types: **`.js`**,**`.ts`**,**`.css`**,**`.scss`**,**`.html`**,**`.json`**,**`.md`**, and more.

- Ignored Folders: **`node_modules`**,**`.git`**,**`dist`**,**`build`**,**`out`**,**`bin`**,**`obj`**,**`vendor`**,**`logs`**,**`temp`**.

- Ignored Root Files: **`README.md`**,**`package.json`**,**`tsconfig.json`**,**`.gitignore`**,**`.env`**, etc.

### Custom Configuration:

To customize the scan, create a `.filescavengerrc` file in your workspace root with the following structure:

```json
{
  "fileTypes": [".js", ".ts", ".css"],
  "ignoreFolders": ["node_modules", "dist"],
  "ignoreRootFiles": ["README.md", "package.json"]
}
```

---

## Screenshots 📸

### Unused Files Tree View

![image](https://github.com/user-attachments/assets/afa604f2-55ad-42e9-82ff-8dff55bc5e5f)

### File Decorations in Explorer

![image](https://github.com/user-attachments/assets/dc7d26f3-7f35-47e8-a3c5-abb0e9309c7b)

### Toggle File Status

![image](https://github.com/user-attachments/assets/314c42e2-cc21-4105-9029-5e2b33ad2f4d)

---

## Contributing 🤝

Contributions are welcome! If you find a bug or have a feature request, contribute to File Scavenger by opening an issue on the [GitHub repository](https://github.com/Dhruv9051/file-scavenger.git).

To contribute code:

- Fork the repository:

    Click the Fork button on the top right of the [repository](https://github.com/Dhruv9051/file-scavenger.git).
    
- Clone the forked repository to your local machine:
    ```bash
    git clone https://github.com/Dhruv9051/file-scavenger.git
    ```
- Create a new branch for your bug or feature:

    ```bash
    git checkout -b feature/your-feature-name
    ```
- Push changes:

    Make your changes and test thoroughly.
    
    Commit your changes and push them to your forked repository:

     ```bash
     git add .
     git commit -m "Add your commit message here"
     git push origin feature/your-feature-name
    ```

- Submit a pull request:

    Go to the original repository and click New Pull Request. Provide a detailed description of your changes.

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Dhruv9051/file-scavenger/blob/main/LICENSE) file for details.

---

## Support ❤️

If you find this extension helpful, consider supporting its development.

- ⭐ Star the repository on GitHub.
- 🐛 Report issues or suggest features in the [Issues Section](https://github.com/Dhruv9051/file-scavenger/issues).
- 💬 Share feedback or ask questions on [Email](mailto:dhruvsuvarna30@gmail.com).

---

## Credits 🙏

- Developed by ***Dhruv***.

- Inspired by the need for cleaner and more efficient workspaces.

- Built with ❤️ for the developer community.
