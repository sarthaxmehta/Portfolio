# Master Profile Document

*Write absolutely everything about your professional background here. Don't worry about length or formatting. Whenever you need a resume for a specific role, I will read this document and extract only the most relevant points to build a tailored 1-page (or 2-page) LaTeX resume.*

## 1. Personal Information
- **Full Name:** Sarthak Mehta
- **Email:** sarthakm.cs.24@nitj.ac.in
- **Phone:** +917814493080
- **LinkedIn URL:** https://www.linkedin.com/in/sarthak-mehta-698457310/
- **GitHub URL:** https://github.com/sarthaxmehta
- **Portfolio/Website URL:** Not Yet
- **Location:** Jalandhar

## 2. Master Skills List
*List every technology you know. I will filter this based on the specific job description.*
- **Programming Languages:** C,C++,Python,HTML,CSS,JavaScript,TypeScript
- **Frameworks & Libraries:** NextJS,ReactJS,TailwindCSS,NextUI,FastAPI, Electron
- **Databases:** MySQL,MongoDB,SQL
- **AI/ML:** PyTorch, TensorFlow, Hugging Face Transformers, LoRA, LLMs, Machine Learning, Deep Learning
- **Tools, Cloud, & DevOps:** Git,GitHub,Vercel,
- **Core Competencies (e.g., System Design, Machine Learning):** Problem Solving, System Design, Machine Learning, Deep Learning

## 3. Work Experience
*List every job, internship, or freelance role. Include as many bullet points as you want for each, detailing your responsibilities, the technologies used, and the impact (metrics, revenue, efficiency).*

### Remote Sensing and GIS Intern at India Space Academy
- **Dates:** Jan 2026 – Feb 2026
- **Location:** Remote
- **Technologies Used:**PyTorch, Google Earth Engine, Random Forest, QGIS, NumPy, Rasterio
- **All Achievements & Responsibilities:**
- Developed an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 multispectral satellite imagery in the Delhi NCR region.
  - Built a multi-stage workflow leveraging Google Earth Engine to compute cloud-based features (NDVI, NDWI, NDBI, GLCM texture).
  - Trained a baseline Random Forest classifier achieving 93.7% overall accuracy and a Kappa Coefficient of 0.91+.
  - Designed and trained a custom Deep Learning Semantic Segmentation model (U-Net) in PyTorch from scratch to achieve highly precise, pixel-level building delineation.

## 4. Projects
*List all your major projects (e.g., ChiefOS, UrbanNet, Vital Archive, AgriMarket). Write down every technical detail, challenge solved, and outcome.*

### ChiefOS - AI Chief of Staff
- **Role/Type:** Full Stack AI Productivity App
- **Dates:** June 2026
- **Technologies Used:** Next.js, React, Prisma (SQLite), Vercel AI SDK, Google Gemini 2.5 Flash
- **All Details & Achievements:**
  - Designed and built a premium AI Operating System acting as an Executive Chief of Staff with a sleek UI, Framer Motion animations, and a deterministic 3-column global layout.
  - Implemented a multi-engine intelligence architecture (Intent, Scheduling, Risk, and Memory Engines) that runs on deterministic logic alongside LLMs.
  - Developed a "Daily Briefing" executive summary using Gemini 2.5 Flash, which parses active tasks and generates proactive strategy recommendations.
  - Integrated a "Smart Calendar Engine" with a drag-and-drop "Unscheduled Missions" sidebar, natively overlaying "Peak Focus" and "Energy Recovery" buffers onto the schedule grid.

### UrbanNet
- **Role/Type:** Geospatial Artificial Intelligence Pipeline
- **Dates:** 2026
- **Technologies Used:** PyTorch, Google Earth Engine, Random Forest, QGIS, NumPy, Rasterio, Deep Learning
- **All Details & Achievements:**
  - Developed an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 multispectral satellite imagery in the Delhi NCR region.
  - Built a multi-stage workflow leveraging Google Earth Engine to compute cloud-based features (NDVI, NDWI, NDBI, GLCM texture).
  - Trained a baseline Random Forest classifier achieving 93.7% overall accuracy and a Kappa Coefficient of 0.91+.
  - Designed and trained a custom Deep Learning Semantic Segmentation model (U-Net) in PyTorch from scratch to achieve highly precise, pixel-level building delineation.

### Vital Archive
- **Role/Type:** Medical Informatics & Analytics Platform
- **Dates:** 2026
- **Technologies Used:** Python, FastAPI, Next.js, Tailwind CSS, Pandas, pdfplumber, Google Gemini 2.5 Flash Lite, Sentence Transformers, SQLite
- **All Details & Achievements:**
  - Engineered an automated ingestion pipeline extracting unstructured text from complex laboratory PDFs and structuring it into strict JSON schemas via Gemini 2.5.
  - Engineered a "Semantic Normalizer" using a local dual-model pipeline (`sentence-transformers`) to compute vector embeddings and normalize disparate test names against a canonical dictionary.
  - Built a Next.js dashboard featuring organ system metrics and longitudinal trend analysis of historical biomarker data using interactive Recharts.
  - Integrated AI-driven automated plain-language narratives summarizing lab results and a context-aware chatbot for querying medical history.

### AgriMarket Profit Optimizer
- **Role/Type:** Data-Driven Profit Calculation Tool
- **Dates:** 2026
- **Technologies Used:** Python, Next.js, FastAPI, Geopy
- **All Details & Achievements:**
  - Built a full-stack tool helping farmers and sellers determine the most profitable market to sell agricultural commodities.
  - Developed a Python logic engine processing a dataset of 325 commodities, calculating geographic distance via `geopy` and deducting transportation costs to output net profits.

## 5. Education
### [Degree Name, e.g., B.S. Computer Science]
- **University:** Dr. B.R. Ambedkar National Institute of Technology Jalandhar
- **Dates:** 2024 - 2028
- **GPA:** 8.63/10
- **Relevant Coursework:** Data Structures & Algorithms, Object-Oriented Programming, DBMS, Computer Networks, Design
and Analysis of Algorithms, Computer Organization & Architecture, Digital Circuits.
- **Honors/Societies:**
1. Core Member of E-Cell NIT Jalandhar
2. Core Member of Q'Mania, Quantum Clum of NIT Jalandhar
## 6. Certifications & Publications (Optional)
- Machine Learning Specialization – Stanford Online & DeepLearning.AI.
- Meta Front-End Developer Professional Certificate - Meta
- 




Some Stuff About Project:


1. Zenvvy Here are the details for the RM (Zenvvy) project, which is a Restaurant Management System specially developed for educational purposes at PM Shri Government Senior Secondary School: 1. GitHub / Version Control https://github.com/sarthaxmehta/Zenvvy 2. Features Zenvvy provides a comprehensive suite of restaurant management tools: Point of Sale (POS): Fast billing and checkout system. Table Management: Visual, real-time representation of table occupancy. Kitchen Display System (KDS): Direct communication for order preparation between front-of-house and kitchen. Menu & Inventory Management: Dynamic menu editing, ingredient stock tracking, and automated low-stock alerts. Analytics & Customers: Detailed revenue reports and a tracking system for returning customers. 3. Architecture The application is a local-first Desktop Application. Frontend: Built with Next.js (App Router) and React 19, utilizing custom CSS components. Desktop Container: The web app is packaged into standalone macOS and Windows native applications using Electron and Electron Builder. Backend: There is no separate cloud server. The backend logic runs locally, interfacing with the database via Prisma ORM. 4. Database The project utilizes a local SQLite database (dev.db) managed by the Prisma ORM. This is a crucial architectural decision that allows the desktop application to function 100% offline without requiring internet connectivity. The schema efficiently maps out relationships between Orders, Tables, MenuItems, and Ingredients (for stock deduction). 5. Authentication Because the application was built for a school environment to encourage technological literacy, it uses a Simulated, Passwordless Authentication System. Instead of strict cryptographic passwords, the app uses a React Context (SimulationContext) that saves a "student educator session" directly in local storage. Students can simply log in by entering their name and selecting a role (like Cashier, Admin, or Kitchen staff) to simulate and test different parts of the restaurant workflow seamlessly. 6. Biggest Engineering Challenge The primary engineering challenge in this architecture is packaging a modern Next.js server and Prisma ORM inside an Electron desktop container. Typically, Next.js and Prisma are designed to run on cloud servers. Bundling them into a single, offline, double-click executable (using electron-builder) while ensuring the local SQLite database path resolves correctly in production on both macOS and Windows requires complex build configurations and careful handling of Node.js native modules.

2. UrbanNet: https://github.com/sarthaxmehta/UrbanNet 1. Tech Stack Geospatial & Remote Sensing: Google Earth Engine (JavaScript API), Sentinel-2 MSI, QGIS Machine Learning: Random Forest (via Google Earth Engine) Deep Learning: PyTorch, Custom U-Net Architecture Data Processing & Visualization: NumPy, Rasterio, Matplotlib 2. Your Exact Contribution (What You Built) You designed and built an end-to-end geospatial artificial intelligence pipeline for automated building footprint extraction from multispectral satellite imagery. Your specific contributions include: Developing a multi-stage workflow starting with cloud-based feature engineering (calculating NDVI, NDWI, NDBI, and GLCM texture) using Google Earth Engine. Implementing an ensemble Machine Learning classification baseline using Random Forest to categorize land cover. Building and training a custom Deep Learning Semantic Segmentation model (U-Net) from scratch in PyTorch to achieve highly precise, pixel-level building delineation. Integrating GIS spatial analysis workflows (using QGIS) to convert the AI's raster predictions into actionable, vector-based GIS shapefiles for calculating built-up area and estimating urban density. 3. Dataset Imagery Source: Sentinel-2 Surface Reflectance (COPERNICUS/S2_SR_HARMONIZED) from the year 2023 with < 10% cloud filtering using a median composite method. Target Region: Delhi NCR. Deep Learning Dataset: 897 custom-generated image patches (256 × 256 resolution) structured for binary segmentation (Building vs. Background). 4. Model(s) Random Forest Classifier: A cloud-scalable machine learning baseline running in GEE (70 Trees, 9 spectral & derived input features). It classifies 4 classes: Buildings, Vegetation, Water, and Roads. U-Net (Convolutional Neural Network): A deep learning semantic segmentation model built in PyTorch (optimized with Adam, BCE loss) tailored specifically for binary building mask extraction. 5. Accuracy / IoU / Metrics Random Forest Performance: Overall Accuracy: 93.7% Kappa Coefficient: 0.91+ Deep Learning (U-Net) Performance: Evaluated via Intersection over Union (IoU), Dice Score, and Validation Loss. While specific numeric IoU scores aren't explicitly stated in the documentation, the U-Net model successfully achieved high boundary precision and outperformed the pixel-based ML classification in accurately delineating structural boundaries. 6. Biggest Engineering Challenge The primary engineering challenge in this project was bridging the gap between cloud-based remote sensing and local deep learning pipelines. Specifically: Multi-dimensional Feature Engineering: Constructing a reliable feature stack that effectively fuses traditional spectral indices (NDVI, NDWI, NDBI) with complex texture-based spatial features (GLCM) to resolve class separability issues in highly dense and diverse urban environments like Delhi NCR. Workflow Integration: Seamlessly transitioning massive geospatial raster data from cloud platforms (Google Earth Engine) down to local tensor-based deep learning workflows (PyTorch), and finally vectorizing the complex raster outputs back into usable format (QGIS) for spatial analytics without losing geographic metadata or precision.

3. ChiefOS, Tech Stack? Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion (for animations), shadcn/ui & Radix UI (for accessible components). Backend: Node.js, Next.js Server Actions & API Routes. Language: TypeScript. Database? SQLite managed via Prisma ORM (prisma/schema.prisma). Authentication? Google Auth AI Model(s)? The project utilizes the Vercel AI SDK to create a robust model fallback chain for different tasks (defined in src/lib/ai/model-provider.ts): Groq Llama 3.3 70B: Used as the primary, high-frequency engine for intent parsing and response streaming. Google Gemini 2.5 Flash / Flash Lite: Used as rapid fallback models if rate limits are hit. Google Gemma 4 26B: Used primarily for task decomposition and generating the daily briefing. Approximately how many APIs? 1 API Route (/api/chief/chat/route.ts) handling the main streaming chat interface. ~18 Server Actions (across src/app/actions.ts and src/app/dashboard/actions.ts) handling database mutations for tasks, scheduling, and subtasks. Total: ~19 API endpoints/actions. Biggest engineering challenge? Deterministic AI Architecture & Formatting: Bridging the gap between unpredictable LLM outputs and a strict deterministic system. It involved: Building a robust IntentEngine that extracts 12+ structured fields from natural language using Zod schemas. Handling date/time offsets smoothly so the LLM (which operates in UTC) renders confirmations in the user's local timezone. Creating a robust fallback mechanism so that if a primary model fails or rate-limits, execution silently falls back to another provider/model without breaking the user experience. Did you implement... Task Scheduling? Yes. The SchedulingEngine deterministically searches for available blocks of time in the user's day and auto-schedules tasks without needing LLM hallucination. Calendar Sync? No. The system manages its own internal calendar and schedule within the SQLite database. There is no external sync (e.g., Google Calendar/Outlook) implemented yet. AI Memory? Yes. The MemoryEngine analyzes the user's past WorkSessions and task history to calculate their optimal deep work time, daily capacity, and frequently postponed categories, injecting this context into the AI's responses. RAG (Retrieval-Augmented Generation)? No. There is no vector database or embedding search. The AI relies on structured extraction, the provided conversation history, and deterministic database queries. Agent Orchestration? Yes. The ChiefEngine acts as an orchestrator. It receives a prompt, routes it to the IntentEngine, passes the structured intent to the ActionPlanner (which interacts with the TaskDecompositionEngine and SchedulingEngine), gathers context from the RiskEngine and MemoryEngine, and finally streams a response via the ResponseGenerator. https://github.com/sarthaxmehta/ChiefOS

4. Vital Archive: 1. Tech Stack Backend: Python with FastAPI. Frontend: React / Next.js (utilizing Server Components), Tailwind CSS for styling, and Recharts for interactive visualizations. Data Processing Pipeline: Pandas, pdfplumber, google-generativeai, and sentence-transformers (PyTorch). 2. Database The application uses a relational SQLite database (vital_archive.db), managed via SQLAlchemy ORM. 3. AI Model The project implements a dual-model pipeline: Google Gemini 2.5 Flash Lite: Used for extracting structured JSON schemas from unstructured text, generating plain-language summaries, and providing context-aware chat capabilities. Local Transformer Model: A local semantic embedding model (vitalarchive_model2 using sentence-transformers) used to normalize disparate medical terms into a canonical taxonomy. 4. OCR? Currently, the application relies on text extraction rather than true Optical Character Recognition (OCR) for scanned images. The README lists true OCR (like Tesseract) for scanned, non-text-selectable PDFs as a "Future Enhancement." 5. PDF Parser? The system uses the pdfplumber Python library to read and extract text matrices and layouts directly from standard PDF documents. 6. How are reports stored? Interestingly, the original PDF files are not stored. When a user uploads a PDF, it is saved to a temporary file (tempfile.NamedTemporaryFile). After the text is extracted by pdfplumber, the temporary PDF is immediately deleted (os.unlink). Only the extracted, structured data is saved in the SQLite reports table across three columns: raw_json: The initial structured data extracted by Gemini. normalized_data: The data after being passed through the semantic normalizer. ai_summary: The generated narrative insights and overviews. 7. Biggest Engineering Challenge According to the documentation, the most significant engineering challenge is Semantic Normalization. Because different laboratories use highly variable naming conventions for the same biomarker (e.g., "Hgb", "H.G.B.", "Hemoglobin, Total"), simple string matching completely fails for tracking longitudinal data. To solve this, the pipeline has to convert all extracted test names into high-dimensional vector embeddings and compute cosine similarities against a strict canonical medical dictionary (health_params.json) to accurately categorize and normalize the historical data. https://github.com/sarthaxmehta/Vital-Archive