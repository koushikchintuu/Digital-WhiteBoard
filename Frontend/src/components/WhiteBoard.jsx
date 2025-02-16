import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import '../styles/Whiteboard.css'

const Whiteboard = ({ roomId }) => {
    const canvasRef = useRef(null)
    const socketRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(5)
    const [isConnected, setIsConnected] = useState(false)
    const lastPosRef = useRef({ x: 0, y: 0 })
    const [drawings, setDrawings] = useState([])
    const [currentIndex, setCurrentIndex] = useState(-1)

    useEffect(() => {
        const socket = io('http://localhost:8000', {
            transports: ['websocket'],
            reconnection: true,
        })

        socketRef.current = socket
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        canvas.width = window.innerWidth * 0.8
        canvas.height = window.innerHeight * 0.8
        context.lineCap = 'round'
        context.lineJoin = 'round'

        socket.on('connect', () => {
            setIsConnected(true)
            socket.emit('join_room', roomId)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('init_state', (state) => {
            setDrawings(state.drawings)
            setCurrentIndex(state.current_index)
            redrawCanvas(state.drawings, state.current_index)
        })

        socket.on('update_state', (state) => {
            setDrawings(state.drawings)
            setCurrentIndex(state.current_index)
            redrawCanvas(state.drawings, state.current_index)
        })

        socket.on('draw_line', (data) => {
            drawLine(data, false)
        })

        socket.on('board_cleared', () => {
            clearCanvas()
            setDrawings([])
            setCurrentIndex(-1)
        })

        return () => socket.disconnect()
    }, [roomId])

    const redrawCanvas = (drawings, index) => {
        const context = canvasRef.current.getContext('2d')
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        
        for (let i = 0; i <= index; i++) {
            const data = drawings[i]
            drawLine(data, false)
        }
    }

    const drawLine = (data, emit = true) => {
        const context = canvasRef.current.getContext('2d')
        context.beginPath()
        context.strokeStyle = data.color
        context.lineWidth = data.brushSize
        context.moveTo(data.startX, data.startY)
        context.lineTo(data.endX, data.endY)
        context.stroke()
        context.closePath()

        if (emit) {
            socketRef.current.emit('draw_line', {
                room_id: roomId,
                startX: data.startX,
                startY: data.startY,
                endX: data.endX,
                endY: data.endY,
                color: data.color,
                brushSize: data.brushSize
            })
        }
    }

    const startDrawing = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        lastPosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
        setIsDrawing(true)
    }

    const draw = (e) => {
        if (!isDrawing) return

        const rect = canvasRef.current.getBoundingClientRect()
        const currentPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }

        drawLine({
            startX: lastPosRef.current.x,
            startY: lastPosRef.current.y,
            endX: currentPos.x,
            endY: currentPos.y,
            color: color,
            brushSize: brushSize
        })

        lastPosRef.current = currentPos
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const handleUndo = () => {
        if (currentIndex >= 0) {
            socketRef.current.emit('undo_action', roomId)
        }
    }

    const handleRedo = () => {
        if (currentIndex < drawings.length - 1) {
            socketRef.current.emit('redo_action', roomId)
        }
    }

    const clearCanvas = () => {
        const context = canvasRef.current.getContext('2d')
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    const handleClearBoard = () => {
        socketRef.current.emit('clear_board', roomId)
    }

    const handleSaveAsPNG = () => {
        try {
            const link = document.createElement('a')
            const dataUrl = canvasRef.current.toDataURL('image/png')
            link.download = `whiteboard-${roomId}-${new Date().toISOString()}.png`
            link.href = dataUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error saving canvas:', error)
            alert('Failed to save the whiteboard as PNG')
        }
    }

    return (
        <div className="whiteboard-container">
            <div className="toolbar">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
                <button 
                    onClick={handleUndo}
                    disabled={currentIndex < 0}
                >
                    Undo
                </button>
                <button 
                    onClick={handleRedo}
                    disabled={currentIndex >= drawings.length - 1}
                >
                    Redo
                </button>
                <button onClick={handleClearBoard}>Clear</button>
                <button onClick={handleSaveAsPNG}>Save as PNG</button>
            </div>
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
                {!isConnected && (
                    <div className="connection-status">
                        Connecting to server...
                    </div>
                )}
            </div>
        </div>
    )
}

export default Whiteboard