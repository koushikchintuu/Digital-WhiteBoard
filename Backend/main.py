from fastapi import FastAPI
import socketio
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=origins,
    logger=True,
    engineio_logger=True
)

socket_app = socketio.ASGIApp(sio, app)

# Store active rooms and their states
rooms = {}
room_states = {}  # {room_id: {'drawings': [], 'current_index': -1}}

@app.get("/")
async def read_root():
    return {"message": "Whiteboard Server"}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, room_id):
    print(f"Client {sid} joining room {room_id}")
    await sio.enter_room(sid, room_id)
    if room_id not in room_states:
        room_states[room_id] = {
            'drawings': [],
            'current_index': -1
        }
    await sio.emit('init_state', room_states[room_id], to=sid)

@sio.event
async def draw_line(sid, data):
    room_id = data.get('room_id')
    if room_id:
        if room_id not in room_states:
            room_states[room_id] = {'drawings': [], 'current_index': -1}
            
        room_data = room_states[room_id]
        # Remove any redo states
        room_data['drawings'] = room_data['drawings'][:room_data['current_index'] + 1]
        room_data['drawings'].append(data)
        room_data['current_index'] += 1
        
        await sio.emit('draw_line', data, room=room_id, skip_sid=sid)
        await sio.emit('update_state', room_data, room=room_id)

@sio.event
async def complete_drawing(sid, data):
    room_id = data.get('room_id')
    if room_id and room_id in room_states:
        room_data = room_states[room_id]
        await sio.emit('update_state', room_data, room=room_id)

@sio.event
async def undo_action(sid, room_id):
    if room_id in room_states:
        room_data = room_states[room_id]
        if room_data['current_index'] >= 0:
            room_data['current_index'] -= 1
            await sio.emit('update_state', room_data, room=room_id)

@sio.event
async def redo_action(sid, room_id):
    if room_id in room_states:
        room_data = room_states[room_id]
        if room_data['current_index'] < len(room_data['drawings']) - 1:
            room_data['current_index'] += 1
            await sio.emit('update_state', room_data, room=room_id)

@sio.event
async def clear_board(sid, room_id):
    if room_id in room_states:
        room_states[room_id] = {
            'drawings': [],
            'current_index': -1
        }
    await sio.emit('board_cleared', room=room_id)

# Mount Socket.IO app
app.mount("/", socket_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )