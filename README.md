# Professional QA Audit Tool

A comprehensive QA audit tool with React.js frontend and Python backend using professional broken link checker libraries for accurate link validation and error reporting.

## 🚀 Features

### Frontend (React.js)

- **Modern React Interface**: Clean, responsive UI with Tailwind CSS
- **Real-time Progress**: Live progress tracking during analysis
- **Comprehensive Tabs**: SEO Metrics, Link Analysis, Error Categories, Statistics
- **Interactive Charts**: Visual representation of audit results
- **Professional Design**: Production-ready interface with smooth animations

### Backend (Python)

- **Professional Link Checking**: Uses industry-standard libraries (requests, aiohttp, BeautifulSoup)
- **Asynchronous Processing**: Fast concurrent link validation
- **Comprehensive Error Handling**: Detailed error categorization and retry mechanisms
- **Accurate Statistics**: Real HTTP requests for precise broken link detection
- **FastAPI Framework**: High-performance API with automatic documentation

## 📊 Analysis Features

### SEO Metrics Analysis

- Title tag analysis (length, optimization)
- Meta description validation
- Heading structure (H1, H2, H3) analysis
- Image analysis with alt text validation
- Content analysis (word count, readability score)
- Technical SEO (canonical URLs, meta robots)

### Professional Link Validation

- **Real HTTP Requests**: Actual HEAD/GET requests to validate links
- **Multiple Request Methods**: HEAD first for speed, GET fallback for reliability
- **Retry Mechanisms**: Up to 3 retries with exponential backoff
- **Comprehensive Error Detection**: Captures exact status codes and error messages
- **Response Time Tracking**: Measures actual response times for each link

### Error Categorization

- **Broken Links**: All non-working links with detailed error information
- **4xx Client Errors**: 404 Not Found, 403 Forbidden, etc.
- **5xx Server Errors**: 500 Internal Server Error, 502 Bad Gateway, etc.
- **Network Errors**: Connection timeouts, DNS failures
- **Redirects**: Links that redirect to other URLs with full redirect chains
- **Timeouts**: Requests that exceeded timeout limits

## 🛠 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

3. **Start the backend server:**

```bash
python start_server.py
```

The backend will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Usage

1. **Start both servers** (backend on port 8000, frontend on port 5173)
2. **Open your browser** to `http://localhost:5173`
3. **Enter a URL** to analyze
4. **View comprehensive results** across multiple tabs:
   - **Overview**: General statistics and key metrics
   - **SEO Metrics**: Detailed SEO analysis with recommendations
   - **Link Analysis**: Professional link validation results
   - **Error Categories**: Categorized errors with detailed information
   - **Statistics**: Comprehensive statistics and charts

## 📈 Professional Libraries Used

### Python Backend

- **`requests`** - Industry-standard HTTP library for synchronous requests
- **`aiohttp`** - High-performance asynchronous HTTP client
- **`beautifulsoup4`** - Professional HTML parsing and link extraction
- **`lxml`** - Fast XML/HTML parser
- **`fastapi`** - Modern, fast web framework for building APIs
- **`uvicorn`** - Lightning-fast ASGI server
- **`validators`** - URL validation
- **`fake-useragent`** - Random user agent generation
- **`asyncio-throttle`** - Rate limiting for concurrent requests

### React Frontend

- **`react`** - Modern UI library
- **`typescript`** - Type safety and better development experience
- **`tailwindcss`** - Utility-first CSS framework
- **`lucide-react`** - Beautiful icons
- **`recharts`** - Professional charts and data visualization

## 🎯 Key Advantages

### Accuracy

- **Real HTTP Requests**: No simulated data - all statistics from actual link validation
- **Professional Libraries**: Uses industry-standard tools for maximum reliability
- **Comprehensive Error Handling**: Detailed error categorization and reporting

### Performance

- **Asynchronous Processing**: Concurrent link checking for fast analysis
- **Smart Request Strategy**: HEAD requests for speed, GET for reliability
- **Configurable Limits**: Adjustable concurrency and timeout settings

### User Experience

- **Real-time Progress**: Live updates during analysis
- **Professional Interface**: Clean, modern design with intuitive navigation
- **Detailed Reporting**: Comprehensive results with actionable insights

## 🔍 API Endpoints

### POST /api/audit

Perform SEO audit on a website

**Request Body:**

```json
{
  "url": "https://example.com",
  "max_concurrent": 15,
  "timeout": 30
}
```

**Response:** Complete audit results with SEO metrics, link analysis, and statistics

### GET /api/health

Health check endpoint

## 📊 Sample Output

The tool provides comprehensive analysis including:

- **SEO Metrics**: Title analysis, meta descriptions, heading structure
- **Link Validation**: Professional broken link detection with status codes
- **Error Categories**: 4xx errors, 5xx errors, network errors, timeouts
- **Statistics**: Success rates, response times, status code distribution
- **Performance Metrics**: Load times, page size, readability scores

## 🚀 Production Deployment

### Backend Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Start production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `http://localhost:8000/docs`
2. Review the console logs for detailed error information
3. Ensure both backend and frontend servers are running
4. Verify the URL format is correct (include http:// or https://)

---

**Professional QA Audit Tool** - Accurate link validation with comprehensive error reporting using industry-standard Python libraries and modern React interface.
