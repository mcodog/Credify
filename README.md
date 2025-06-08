# Credify - Blockchain-Based Certificate Verification System

A secure, tamper-proof certificate verification platform that leverages blockchain technology, AI-powered OCR, and modern web technologies to provide instant credential verification.

[![Credify Logo](https://res.cloudinary.com/dbmphjpzw/image/upload/v1749378614/Credify_1_bahhig.png)](https://credify-marks-projects-4471a6f6.vercel.app)


## 🌟 Features

- **Instant Verification**: Get certificates verified in seconds using blockchain technology
- **Tamper-Proof Security**: Blockchain-secured certificates that cannot be forged or altered
- **AI-Powered OCR**: Automatic text extraction from certificate images and PDFs
- **Easy Integration**: Simple API for institutions and platforms
- **Real-time Statistics**: Live tracking of verification metrics
- **Multi-format Support**: Support for both image and PDF certificates
- **Admin Dashboard**: Complete certificate management system

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Blockchain    │
│   (React)       │────│   (Node.js)      │────│   (Motoko)      │
│                 │    │                  │    │                 │
│ • Verification  │    │ • Certificate    │    │ • Smart         │
│ • Admin Panel   │    │   Processing     │    │   Contracts     │
│ • Dashboard     │    │ • OCR Service    │    │ • Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────┐
                       │  Database    │
                       │ (Supabase)   │
                       │              │
                       │ • Metadata   │
                       │ • User Data  │
                       │ • Statistics │
                       └──────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Cloudinary account
- Internet Computer (IC) development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajrespall/credify.git
   cd credify
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   HF_TOKEN=your_hf_token
   ```

4. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   
   Backend:
   ```bash
   cd backend
   npm start
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## 🔗 Smart Contract Integration

Credify uses Internet Computer Protocol (ICP) with Motoko smart contracts for blockchain functionality.

### Smart Contract Architecture

The system integrates with blockchain through the Motoko service:

```javascript
// Smart Contract Interface
export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    storeCertificate: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [],
      []
    ),
    getCertificate: IDL.Func(
      [IDL.Text],
      [IDL.Opt(CertificateRecord)],
      ["query"]
    ),
    revokeCertificate: IDL.Func(
      [IDL.Text],
      [IDL.Bool],
      ["query"]
    ),
    listCertificates: IDL.Func(
      [],
      [IDL.Vec(IDL.Text)],
      ["query"]
    )
  });
};
```

### Certificate Storage Process

1. **File Processing**: Certificate uploaded and processed through OCR
2. **Hash Generation**: SHA-256 hashes generated for file and content
3. **Database Storage**: Metadata stored in Supabase
4. **Blockchain Storage**: Certificate data stored on IC blockchain
5. **Verification**: Certificates verified against blockchain records

## 📊 How It Works

### Certificate Upload & Processing

1. **File Upload**: Users upload certificate files (PDF/Image)
2. **OCR Processing**: AI extracts text content using Qwen2.5-VL model
3. **Hash Generation**: 
   - File Hash: SHA-256 of the original file
   - Content Hash: SHA-256 of extracted text
4. **Cloud Storage**: Files stored securely on Cloudinary
5. **Blockchain Storage**: Certificate data stored on IC blockchain

### Verification Process

1. **File Upload**: User uploads certificate for verification
2. **Hash Comparison**: System generates hashes and compares with stored records
3. **Blockchain Verification**: Cross-references with blockchain records
4. **Result Display**: Shows verification status and certificate details

## 🗄️ Database Schema

### Certificates Table
```sql
certificates (
  id: uuid PRIMARY KEY,
  certificate_hash: text,
  certificate_name: text,
  user_id: uuid,
  image_url: text,
  file_type: text,
  ocr_content: text,
  file_hash: text,
  content_hash: text,
  file_size: bigint,
  mime_type: text,
  verification_status: text,
  revoked_at: timestamp,
  created_at: timestamp
)
```

### Hash Table (Legacy Support)
```sql
hash (
  id: uuid PRIMARY KEY,
  file_hash: text,
  content_hash: text,
  user_id: uuid,
  certificate_id: uuid,
  created_at: timestamp
)
```

## 🔧 API Endpoints

### Certificate Management
- `POST /certificates/upload-base64` - Upload and process certificate
- `GET /certificates/all` - Get all certificates
- `GET /certificates/user/:userId` - Get user's certificates
- `GET /certificates/stats` - Get certificate statistics
- `POST /certificates/revoke/:certificateId` - Revoke certificate
- `POST /certificates/unrevoke/:certificateId` - Unrevoke certificate

### Verification
- `POST /verification/verify` - Verify certificate
- `GET /verification/stats` - Get verification statistics

## 🛡️ Security Features

- **Cryptographic Hashing**: SHA-256 hashing for file integrity
- **Blockchain Immutability**: Tamper-proof storage on IC blockchain
- **Access Control**: Role-based access for admin functions
- **Secure File Storage**: Encrypted storage on Cloudinary
- **Input Validation**: Comprehensive validation for all inputs

## 🎨 Frontend Structure

```
src/
├── components/
│   ├── layouts/          # Header, navigation components
│   └── Welcome/          # Landing page components
├── features/
│   ├── certificates/     # Certificate management Redux slices
│   └── verification/     # Verification Redux slices
├── pages/
│   ├── Admin/           # Admin dashboard pages
│   └── Welcome/         # Public pages
└── utils/               # Utility functions and axios config
```

## 👥 Team

- **Rajesh T. Respall** - Full Stack Developer ([@rajrespall](https://github.com/rajrespall))
- **Diana Marie N. Carreon** - UI/UX Lead Designer ([@dayaannaa](https://github.com/dayaannaa))
- **Mark Al Rayn D. Bartolome** - UI/UX Assistant ([@sadvoidhours](https://github.com/sadvoidhours))
- **Angelo Miguel S.Dacumos** - Full Stack Developer ([@noellezzz](https://github.com/noellezzz))
- **Dr. Rico S. Santos** - Project Advisor & Mentor ([@dimitrio25](https://github.com/dimitrio25))

## 🔮 Technology Stack

**Frontend:**
- React 18 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation

**Backend:**
- Node.js with Express
- Supabase for database
- Cloudinary for file storage

**Blockchain:**
- Internet Computer Protocol (ICP)
- Motoko programming language
- Agent-js for IC integration

**DevOps:**
- DFX for IC development
- Environment-based configuration
- RESTful API architecture

## 📝 Usage Examples

### Uploading a Certificate
```javascript
const uploadCertificate = async (fileData, userId) => {
  const response = await axios.post('/certificates/upload-base64', {
    fileData,
    userId,
    mode: 'process'
  });
  return response.data;
};
```

### Verifying a Certificate
```javascript
const verifyCertificate = async (fileData) => {
  const response = await axios.post('/verification/verify', {
    fileData
  });
  return response.data;
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Support

For support, email dacumosmiguel@gmail.com or create an issue on GitHub.

## 🔗 Links

- [Motoko service github link](https://github.com/noellezzz/Credify_Motoko)

---

**Built with ❤️ by the HackStars Team**
