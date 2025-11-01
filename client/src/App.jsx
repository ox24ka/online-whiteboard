import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [isConnected, setIsConnected] = useState(false)

  // WebSocket URL - 環境変数から取得、なければローカル
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Canvasのサイズを設定
    const resizeCanvas = () => {
      const container = canvas.parentElement
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // WebSocket接続
    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.type === 'init') {
          // 初期化: 既存の描画履歴を再生
          const ctx = canvas.getContext('2d')
          message.data.forEach(drawData => {
            if (drawData.type === 'draw') {
              drawLine(ctx, drawData.data)
            }
          })
        } else if (message.type === 'draw') {
          // 他のユーザーの描画
          const ctx = canvas.getContext('2d')
          drawLine(ctx, message.data)
        } else if (message.type === 'clear') {
          // キャンバスクリア
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        // 再接続を試みる
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      wsRef.current = ws
    }

    connectWebSocket()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [WS_URL])

  const drawLine = (ctx, data) => {
    ctx.strokeStyle = data.color
    ctx.lineWidth = data.lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(data.x0, data.y0)
    ctx.lineTo(data.x1, data.y1)
    ctx.stroke()
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 開始点を記憶
    canvasRef.current.lastX = x
    canvasRef.current.lastY = y
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    const drawData = {
      x0: canvas.lastX,
      y0: canvas.lastY,
      x1: x,
      y1: y,
      color: color,
      lineWidth: lineWidth
    }

    // ローカルに描画
    drawLine(ctx, drawData)

    // WebSocketで送信
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        data: drawData
      }))
    }

    // 次の描画のために現在位置を記憶
    canvas.lastX = x
    canvas.lastY = y
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // WebSocketでクリアを送信
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'clear'
      }))
    }
  }

  return (
    <div className="app">
      <div className="toolbar">
        <h1>オンラインホワイトボード</h1>
        <label>
          色:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          太さ: {lineWidth}px
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
        </label>
        <button className="clear" onClick={clearCanvas}>
          クリア
        </button>
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '接続中' : '切断'}
        </div>
      </div>
    </div>
  )
}

export default App
