'use server';

import { prisma } from '../lib/prisma';

const SEED_PROJECTS = [
  {
    title: 'ChiefOS',
    description: 'A premium AI-driven Chief of Staff operating system featuring a deterministic multi-engine architecture (Intent, Scheduling, Risk, and Memory) that structures calendar buffers and decomposites daily briefings using Groq, Llama, and Gemini 2.5.',
    tags: 'Next.js,React 19,Prisma,SQLite,Gemini,Vercel AI SDK,Tailwind v4',
    imageUrl: '/projects/chiefos.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/ChiefOS',
    featured: true,
  },
  {
    title: 'UrbanNet',
    description: 'An end-to-end Geospatial AI Pipeline for automated building footprint extraction from Sentinel-2 satellite imagery. Fuses cloud feature engineering in Google Earth Engine with a custom U-Net Semantic Segmentation model in PyTorch, achieving 93.7% accuracy.',
    tags: 'PyTorch,Google Earth Engine,QGIS,U-Net,Remote Sensing,GIS,NumPy',
    imageUrl: '/projects/urbannet.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/UrbanNet',
    featured: true,
  },
  {
    title: 'Vital Archive',
    description: 'A medical informatics platform that parses unstructured laboratory report PDFs, normalizes disparate biomarker naming conventions using a local sentence-transformers vector model, and displays longitudinal health trends on Next.js interactive dashboards.',
    tags: 'Python,FastAPI,Next.js,Sentence Transformers,Gemini AI,SQLite,Recharts',
    imageUrl: '/projects/vitalarchive.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/Vital-Archive',
    featured: true,
  },
  {
    title: 'Zenvvy',
    description: 'A local-first offline Desktop Restaurant Management System featuring POS, table mapping, kitchen displays, and automatic inventory alerts. Packaged into a standalone macOS and Windows app using Next.js, Electron, SQLite, and Prisma ORM.',
    tags: 'Electron,Next.js,React 19,SQLite,Prisma,Offline-First',
    imageUrl: '/projects/zenvvy.png',
    projectUrl: null,
    githubUrl: 'https://github.com/sarthaxmehta/Zenvvy',
    featured: false,
  },
  {
    title: 'AgriMarket Profit Optimizer',
    description: 'A full-stack data-driven profit calculator for farmers that processes a dataset of 325 agricultural commodities. Integrates Geopy to compute real-time transport costs and identify the most profitable market.',
    tags: 'Python,FastAPI,Next.js,Geopy,Data Analytics',
    imageUrl: '/projects/agrimarket.png',
    projectUrl: null,
    githubUrl: null,
    featured: false,
  },
];

export async function getProjects() {
  try {
    let projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (projects.length === 0) {
      console.log('Seeding initial projects from profile...');
      await prisma.project.createMany({
        data: SEED_PROJECTS,
      });
      projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return { success: true, projects };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error.message || 'Failed to fetch projects.' };
  }
}
