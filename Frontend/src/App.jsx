import { useState } from 'react'
import Whiteboard from './components/WhiteBoard'
import './App.css'

function App() {
    // Generate a random room ID or use a fixed one for testing
    const roomId = 'test-room-1'

    return (
        <div className="app">
            <h1>Collaborative Whiteboard</h1>
            <p>Room ID: {roomId}</p>
            <Whiteboard roomId={roomId} />
        </div>
    )
}

export default App