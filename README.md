# Online Drive

## Overview

**Online Drive** is a web application that simulates the core functionalities of Google Drive, enabling users to manage files and folders with essential features. This application includes user authentication and various file management capabilities, built with React, Firebase, Node.js, and MongoDB.

### Key Features
- **User Authentication**: Sign up, log in, and log out to access your files securely.
- **File & Folder Management**: Create, rename, delete, and organize files and folders.
- **File Upload & Download**: Upload files from your local device and download them as needed.
- **Navigation**: Browse through folders with a sidebar and breadcrumbs for intuitive navigation.
- **Duplicate Prevention**: Prevent creation of duplicate files and folders.

## Setup Instructions

To set up the development environment and run the Online Drive application locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/LYNC-Full-Stack-Developer-Task.git
   cd LYNC-Full-Stack-Developer-Task
   cd online-drive-client
   npm install

   cd auth-backend
   npm install
   

2. **create .env files in both client and server directories**
```bash 
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
**The frontend will be accessible at http://localhost:3000.**


## Usage Guide

### User Authentication

- **Sign Up**: Register a new account with your email and password. Use the sign-up form on the homepage to create a new account.
- **Log In**: Access your account by entering your credentials (email and password) on the login page.
- **Log Out**: Securely log out of your account by clicking the "Log Out" button available in the user menu.

### File & Folder Management

- **Create**: To add new items, click on the "File Upload" or "New Folder" button. Provide a name for the new file or folder in the prompt that appears.
- **Rename**: To rename an existing item, select the item and choose the "Rename" option. Enter the new name in the prompt and confirm the change.
- **Delete**: To delete items, select the file or folder you wish to remove and click the "Delete" button. Confirm the deletion in the dialog box that appears.
- **Browse**: Navigate through folders by double-clicking on them. This action will open the folder and display its contents.
- **Upload & Download**: Click the "Upload" button to add files from your local device. To download files, select the file and click the "Download" button.

### Navigation

- **Sidebar**: Use the sidebar to view and navigate through your files and folders. It displays a hierarchical view of your file system.
- **Breadcrumbs**: Breadcrumbs show your current location within the file system. Use the breadcrumb links to navigate back to previous folders or to the root directory.


## Dependencies

The project uses the following external dependencies and libraries:

- **React**: For building the user interface.
- **Firebase & Firestore**: For authentication and cloud storage.
- **Node.js**: For backend development.
- **Express.js**: For creating RESTful APIs.
- **MongoDB**: For database management.
- **Axios**: For making HTTP requests.
- **FileSaver.js**: For saving files on the client-side.
- **JSZip**: For creating and reading ZIP files in JavaScript.