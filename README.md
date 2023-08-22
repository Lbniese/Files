# NodeJS Chat & File Manager

Welcome to the NodeJS Chat & File Manager! This project provides a simple chat application combined with a file manager, built using NodeJS for the backend and a static HTML frontend.

## Features:

1. **Chat Program**: Connect with other users and send messages in real-time.
2. **File Manager**: Upload, download, and manage files efficiently.

## Prerequisites:

- [NodeJS](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/)

## Installation:

1. Clone this repository:

\```
git clone https://github.com/your-username/nodejs-chat-file-manager.git
\```

2. Change directory to the cloned repository:

\```
cd nodejs-chat-file-manager
\```

3. Install the required dependencies:

\```
npm install
\```

## Running the App:

1. Start the NodeJS server:

\```
npm start
\```

2. Open your browser and navigate to:

\```
http://localhost:3000/
\```

## Usage:

### Chat:

1. Navigate to the chat section.
2. Enter a username.
3. Start chatting!

### File Manager:

1. Navigate to the file manager section.
2. Use the "Upload" button to upload files.
3. Browse through the files, and click on the file names to download them.
4. Use the "Delete" button next to each file to remove them.

## Project Structure:

\```
.
|-- assets/
|   |-- css/
|   |-- js/
|-- views/
|   |-- chat.html
|   |-- file-manager.html
|-- app.js
|-- package.json
|-- README.md
\```

## Contributing:

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to submit pull requests.

## License:

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## Acknowledgments:

- NodeJS Community
- All open-source libraries and their maintainers used in this project.

---

Happy chatting & managing files! 🚀


#### Create DB & Get URL ####

1. `$ heroku addons:create cleardb:ignite`

2. `$ heroku config | grep CLEARDB_DATABASE_URL`
