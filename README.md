# Digital-WhiteBoard
# Digital Whiteboard

## Overview
The Digital Whiteboard is a real-time collaborative drawing application built with React (Vite) for the frontend and FastAPI for the backend. It allows multiple users to draw, erase, undo/redo, and save their drawings while syncing in real-time using WebSockets.

## Features
- **Real-time drawing** with WebSocket communication
- **Undo/Redo** functionality
- **Change brush color and size**
- **Clear the board**
- **Save drawing as PNG**
- **Multiple users collaboration**
- **Fast and lightweight UI**

## Technologies Used
### Frontend:
- React (Vite)
- Socket.io-client
- CSS (for styling)

### Backend:
- FastAPI
- WebSockets
- MongoDB (for storing drawing states)

## Installation and Setup

### Prerequisites
- Node.js (for running the frontend)
- Python (for running the backend)
- MongoDB (if persistence is needed)

### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```sh
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Usage
1. Open the frontend application in your browser.
2. Join a room by entering a room ID.
3. Start drawing and collaborating with other users in real-time.
4. Use toolbar options to change brush size, color, undo, redo, clear, or save.

## Project Structure
```
Digital-Whiteboard/
│── backend/
│   ├── main.py              # FastAPI server with WebSockets
│   ├── requirements.txt     # Backend dependencies
│   ├── ... (other backend files)
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Whiteboard.jsx   # Main Whiteboard component
│   │   ├── styles/
│   │   │   ├── Whiteboard.css   # Styling for the whiteboard
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── ... (other frontend files)
│
│── README.md               # Project documentation
```

## Future Enhancements
- Add text and shape drawing tools
- User authentication and room management
- Persistent storage of whiteboard states
- Mobile-friendly UI improvements

## License
This project is open-source under the MIT License.

## Contributing
Feel free to submit pull requests or report issues on the GitHub repository!

