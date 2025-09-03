// CloudLinux compatible server for shared hosting
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

// Optimize for shared hosting
const app = next({ 
  dev, 
  hostname, 
  port,
  // Reduce memory usage
  conf: {
    compress: true,
    poweredByHeader: false,
    generateEtags: false
  }
})

const handle = app.getRequestHandler()

// Add graceful shutdown for shared hosting
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Set timeout to prevent incomplete responses
      res.setTimeout(30000, () => {
        console.log('Request timeout for:', req.url)
        if (!res.headersSent) {
          res.statusCode = 504
          res.end('Gateway Timeout')
        }
      })

      // Add headers for shared hosting compatibility
      res.setHeader('X-Powered-By', 'MAGNET-BPS')
      res.setHeader('Connection', 'close') // Force connection close for shared hosting
      
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('Internal server error')
      }
    }
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`🚀 MAGNET-BPS ready on http://${hostname}:${port}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  })

  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}`)
      server.listen(port + 1)
    } else {
      console.error('Server error:', err)
    }
  })
})

