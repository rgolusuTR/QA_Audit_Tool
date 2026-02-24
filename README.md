# QA Audit Tool - Client-Side Edition

A comprehensive, browser-based QA audit tool that performs SEO analysis, link checking, image optimization analysis, and more - all without requiring a backend server!

## 🌟 Features

- **✅ 100% Client-Side** - No backend required, runs entirely in your browser
- **🔍 SEO Analysis** - Title, meta descriptions, headings, canonical URLs
- **🔗 Link Checking** - Validates internal and external links
- **🖼️ Image Analysis** - Alt text validation, size recommendations
- **📝 Spell Checking** - Basic spelling error detection
- **📊 Readability Score** - Flesch Reading Ease calculation
- **📈 Comprehensive Statistics** - Detailed metrics and insights

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment

This tool is designed to be deployed to **GitHub Pages** or any static hosting service.

### Deploy to GitHub Pages

1. **Update repository settings:**
   - Go to your GitHub repository
   - Navigate to Settings > Pages
   - Set Source to "GitHub Actions"

2. **Push to master branch:**
   ```bash
   git add .
   git commit -m "Deploy QA Audit Tool"
   git push origin master
   ```

3. **GitHub Actions will automatically:**
   - Build the application
   - Deploy to GitHub Pages
   - Your site will be available at: `https://yourusername.github.io/QA_Audit_Tool/`

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains your production-ready files
# Upload the contents to any static hosting service
```

## 📖 Usage

1. **Enter a URL** - Type or paste any website URL
2. **Click Analyze** - The tool will fetch and analyze the page
3. **View Results** - Comprehensive audit results with actionable insights
4. **Export Data** - Download results as JSON for further analysis

### Example URLs to Test

- `https://example.com`
- `https://www.wikipedia.org`
- Any publicly accessible website

## ⚠️ CORS Limitations

Since this tool runs entirely in the browser, it's subject to CORS (Cross-Origin Resource Sharing) restrictions:

- **✅ Works well with:**
  - Websites that allow CORS
  - Same-origin pages
  - Sites with permissive CORS policies

- **⚠️ May have limitations with:**
  - External websites with strict CORS policies
  - Some external link checking features

- **💡 Workaround:**
  - The tool uses a CORS proxy as a fallback
  - Internal/company websites typically work better
  - Consider using browser extensions that disable CORS for testing

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** GitHub Pages

## 📁 Project Structure

```
QA_Audit_Tool/
├── src/
│   ├── components/        # React components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── clientAudit.ts  # Main audit logic
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages deployment
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` is pre-configured for GitHub Pages deployment:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/QA_Audit_Tool/", // Update this to match your repo name
});
```

**Important:** Update the `base` path to match your GitHub repository name.

## 🧪 Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## 📊 Audit Features

### SEO Metrics
- Page title and length
- Meta description and length
- Heading structure (H1-H6)
- Canonical URL
- Meta robots tags
- Language detection
- Word count
- Readability score

### Link Analysis
- Total links count
- Working vs broken links
- Internal vs external links
- Response times
- Status code distribution
- Error categorization

### Image Analysis
- Alt text validation
- Image dimensions
- Format recommendations
- Optimization suggestions

### Content Analysis
- Spell checking
- Readability scoring
- Word count statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🐛 Known Issues

1. **CORS Restrictions:** Some websites may block cross-origin requests
2. **External Link Checking:** Limited due to browser security policies
3. **Large Pages:** Very large pages may take longer to analyze

## 🔮 Future Enhancements

- [ ] Enhanced spell checking with more dictionaries
- [ ] Mobile responsiveness testing
- [ ] Performance metrics (Core Web Vitals)
- [ ] Accessibility (a11y) auditing
- [ ] PDF report generation
- [ ] Historical audit comparison

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/QA_Audit_Tool/issues) page
2. Create a new issue with detailed information
3. Include the URL you're trying to audit and any error messages

## 🎉 Acknowledgments

Built with modern web technologies to provide a fast, reliable, and user-friendly QA auditing experience.

---

**Made with ❤️ for Quality Assurance**