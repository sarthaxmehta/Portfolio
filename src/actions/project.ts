'use server';

import { prisma } from '../lib/prisma';
import { isAuthorizedAdmin } from '../lib/auth';

const SEED_PROJECTS = [
  {
    num: '01',
    title: 'ChiefOS',
    desc: 'A premium AI Operating System acting as an executive Chief of Staff with a multi-engine intelligence architecture.',
    tags: 'Next.js,React 19,Prisma,SQLite,Gemini AI,Groq,Vercel AI SDK',
    imageUrl: '/projects/chiefos.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/ChiefOS',
    architecture: 'Next.js 16 (App Router) + SQLite via Prisma ORM + Groq Llama 3.3 70B + Gemini 2.5 Flash',
    contributions: JSON.stringify([
      'Designed multi-engine AI orchestrator — Intent, Scheduling, Risk, and Memory Engines working in concert.',
      'Built deterministic timezone offset algorithm resolving LLM UTC outputs to local user time without hallucination.',
      'Created high-capacity model fallback pipeline switching workloads seamlessly under rate limits.',
      'Implemented "Daily Briefing" using Gemini 2.5 generating proactive, executive-level strategy recommendations.',
    ]),
    challenge: 'Bridging unpredictable LLM completions with strict database transactions — solved by building Zod-based parser engines that validate all AI inputs synchronously before execution.',
    featured: true,
    order: 1,
  },
  {
    num: '02',
    title: 'UrbanNet',
    desc: 'End-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 multispectral satellite imagery.',
    tags: 'PyTorch,U-Net,Google Earth Engine,QGIS,NumPy,Rasterio',
    imageUrl: '/projects/urbannet.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/UrbanNet',
    architecture: 'PyTorch (Custom U-Net ConvNet) + Google Earth Engine JavaScript API + QGIS + NumPy + Rasterio',
    contributions: JSON.stringify([
      'Engineered cloud-based multispectral feature workflows computing NDVI, NDWI, NDBI, and GLCM texture.',
      'Trained Random Forest classifier achieving 93.7% overall accuracy with Kappa coefficient 0.91+.',
      'Built PyTorch U-Net segmentation pipeline for high-precision pixel-level boundary delineation.',
      'Integrated GIS spatial analysis converting AI raster predictions into usable vector shapefiles via QGIS.',
    ]),
    challenge: 'Transitioning massive geospatial raster data from cloud GEE to local PyTorch tensor arrays without geospatial metadata loss — solved via custom raster block mapping with Rasterio.',
    featured: true,
    order: 2,
  },
  {
    num: '03',
    title: 'Vital Archive',
    desc: 'Medical informatics platform that extracts structured data from complex lab PDFs, normalizes biomarker names semantically, and visualizes longitudinal health trends.',
    tags: 'FastAPI,Next.js,Gemini AI,Sentence Transformers,SQLite,Recharts',
    imageUrl: '/projects/vitalarchive.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/Vital-Archive',
    architecture: 'Python FastAPI + Next.js + SQLite via SQLAlchemy + Sentence Transformers (PyTorch) + Gemini 2.5 Flash Lite',
    contributions: JSON.stringify([
      'Created automated PDF ingestion pipeline extracting text matrices via pdfplumber and structuring via Gemini 2.5.',
      'Developed semantic normalization pipeline using local Sentence Transformer vector embeddings.',
      'Built interactive React dashboard with organ system metrics and longitudinal biomarker trend charts.',
      'Integrated AI-generated plain-language summaries and context-aware chat for medical history queries.',
    ]),
    challenge: 'Normalizing highly inconsistent biomarker labels across disparate clinical labs — solved by building a local vector embedding matcher using sentence-transformers.',
    featured: true,
    order: 3,
  },
  {
    num: '04',
    title: 'Zenvvy',
    desc: 'A local-first offline Desktop Restaurant Management System featuring POS, table mapping, kitchen displays, and automatic inventory alerts.',
    tags: 'Electron,Next.js,React 19,SQLite,Prisma,Offline-First',
    imageUrl: '/projects/zenvvy.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/Zenvvy',
    architecture: 'Next.js 16 + Electron Container + Local SQLite via Prisma ORM + Simulated Passwordless Role Context',
    contributions: JSON.stringify([
      'Packaged Next.js App Router server and Prisma SQLite ORM inside a native Electron executable.',
      'Designed POS billing system, visual table occupancy map, and live Kitchen Display System (KDS).',
      'Engineered automated inventory stock deduction and dynamic menu configuration.',
    ]),
    challenge: 'Bundling Next.js server and Prisma binary targets into an offline, double-clickable Electron app across macOS and Windows — solved with custom electron-builder native module paths.',
    featured: false,
    order: 4,
  },
  {
    num: '05',
    title: 'AgriMarket Profit Optimizer',
    desc: 'Data-driven profit calculator for farmers that processes a dataset of 325 agricultural commodities, computing real-time transport costs to identify the optimal market.',
    tags: 'Python,FastAPI,Next.js,Geopy,Data Analytics',
    imageUrl: '/projects/agrimarket.png',
    projectUrl: null,
    githubUrl: null,
    architecture: 'Python FastAPI + Next.js + Geopy Spatial Analytics Engine + Commodity Data Pipeline',
    contributions: JSON.stringify([
      'Engineered a distance and logistics calculator utilizing Geopy to compute road distances between farms and regional markets.',
      'Processed price variance across 325 agricultural commodities to maximize net profit after transit fees.',
    ]),
    challenge: 'Handling real-time matrix distance computations across hundreds of market locations efficiently.',
    featured: false,
    order: 5,
  },
];

export async function getProjects() {
  try {
    let projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    if (projects.length === 0) {
      console.log('Seeding initial projects...');
      await prisma.project.createMany({
        data: SEED_PROJECTS,
      });
      projects = await prisma.project.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
    }

    return { success: true, projects };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error.message || 'Failed to fetch projects.' };
  }
}

export async function createProject(data: {
  num?: string;
  title: string;
  desc: string;
  tags: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  architecture?: string;
  contributions?: string[];
  challenge?: string;
  featured?: boolean;
  order?: number;
}) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    if (!data.title || !data.desc || !data.tags) {
      return { success: false, error: 'Please provide Title, Description, and Tags.' };
    }

    const project = await prisma.project.create({
      data: {
        num: data.num || null,
        title: data.title,
        desc: data.desc,
        tags: data.tags,
        imageUrl: data.imageUrl || '/projects/placeholder.png',
        projectUrl: data.projectUrl || null,
        githubUrl: data.githubUrl || null,
        architecture: data.architecture || null,
        contributions: data.contributions ? JSON.stringify(data.contributions) : null,
        challenge: data.challenge || null,
        featured: data.featured || false,
        order: data.order || 0,
      },
    });

    return { success: true, project };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { success: false, error: error.message || 'Failed to create project.' };
  }
}

export async function updateProject(
  id: string,
  data: {
    num?: string;
    title?: string;
    desc?: string;
    tags?: string;
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;
    architecture?: string;
    contributions?: string[];
    challenge?: string;
    featured?: boolean;
    order?: number;
  }
) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.num !== undefined && { num: data.num }),
        ...(data.title && { title: data.title }),
        ...(data.desc && { desc: data.desc }),
        ...(data.tags && { tags: data.tags }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.projectUrl !== undefined && { projectUrl: data.projectUrl }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
        ...(data.architecture !== undefined && { architecture: data.architecture }),
        ...(data.contributions && { contributions: JSON.stringify(data.contributions) }),
        ...(data.challenge !== undefined && { challenge: data.challenge }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return { success: true, project };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { success: false, error: error.message || 'Failed to update project.' };
  }
}

export async function deleteProject(id: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    await prisma.project.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message || 'Failed to delete project.' };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { featured },
    });
    return { success: true, project };
  } catch (error: any) {
    console.error('Error toggling featured:', error);
    return { success: false, error: error.message || 'Failed to toggle featured state.' };
  }
}
