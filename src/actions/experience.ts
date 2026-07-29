'use server';

import { prisma } from '../lib/prisma';
import { isAuthorizedAdmin } from '../lib/auth';

const SEED_EXPERIENCES = [
  {
    title: 'Remote Sensing & GIS Intern',
    organization: 'India Space Academy',
    location: 'Remote',
    type: 'Internship',
    startDate: 'Jan 2026',
    endDate: 'Feb 2026',
    current: false,
    description: 'Built an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 satellite imagery in the Delhi NCR region.',
    bulletPoints: JSON.stringify([
      'Developed an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 multispectral satellite imagery.',
      'Built a multi-stage workflow leveraging Google Earth Engine to compute cloud-based features (NDVI, NDWI, NDBI, GLCM texture).',
      'Trained a baseline Random Forest classifier achieving 93.7% overall accuracy and a Kappa Coefficient of 0.91+.',
      'Designed and trained a custom Deep Learning Semantic Segmentation model (U-Net) in PyTorch from scratch for pixel-level building delineation.',
    ]),
    technologies: 'PyTorch,Google Earth Engine,Random Forest,QGIS,NumPy,Rasterio',
    order: 1,
  },
  {
    title: 'B.Tech in Computer Science',
    organization: 'NIT Jalandhar',
    location: 'Jalandhar, Punjab',
    type: 'Education',
    startDate: '2024',
    endDate: 'Present',
    current: true,
    description: "Studying Computer Science & Engineering at Dr. B.R. Ambedkar National Institute of Technology Jalandhar. Core Member of E-Cell and Q'Mania Quantum Club.",
    bulletPoints: JSON.stringify([
      'Maintaining an 8.65 / 10 cumulative GPA across computer science and engineering coursework.',
      'Active leader and technical core member of E-Cell NIT Jalandhar and Q\'Mania Quantum Club.',
      'Relevant Coursework: Data Structures & Algorithms, OOP, DBMS, Computer Networks, DAA, Computer Organization, Digital Circuits.',
    ]),
    technologies: 'C++,Python,Next.js,Data Structures,Algorithms,Machine Learning',
    order: 2,
  },
];

export async function getExperiences() {
  try {
    let experiences = await prisma.experience.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    if (experiences.length === 0) {
      console.log('Seeding initial experiences...');
      await prisma.experience.createMany({
        data: SEED_EXPERIENCES,
      });
      experiences = await prisma.experience.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
    }

    return { success: true, experiences };
  } catch (error: any) {
    console.error('Error fetching experiences:', error);
    return { success: false, error: error.message || 'Failed to fetch experiences.' };
  }
}

export async function createExperience(data: {
  title: string;
  organization: string;
  location?: string;
  type: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  bulletPoints?: string[];
  technologies?: string;
  order?: number;
}) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    if (!data.title || !data.organization || !data.startDate) {
      return { success: false, error: 'Please provide Title, Organization, and Start Date.' };
    }

    const exp = await prisma.experience.create({
      data: {
        title: data.title,
        organization: data.organization,
        location: data.location || null,
        type: data.type || 'Work',
        startDate: data.startDate,
        endDate: data.endDate || null,
        current: data.current || false,
        description: data.description || null,
        bulletPoints: data.bulletPoints ? JSON.stringify(data.bulletPoints) : null,
        technologies: data.technologies || null,
        order: data.order || 0,
      },
    });

    return { success: true, experience: exp };
  } catch (error: any) {
    console.error('Error creating experience:', error);
    return { success: false, error: error.message || 'Failed to create experience.' };
  }
}

export async function updateExperience(
  id: string,
  data: {
    title?: string;
    organization?: string;
    location?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    bulletPoints?: string[];
    technologies?: string;
    order?: number;
  }
) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const exp = await prisma.experience.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.organization && { organization: data.organization }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.type && { type: data.type }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.current !== undefined && { current: data.current }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.bulletPoints && { bulletPoints: JSON.stringify(data.bulletPoints) }),
        ...(data.technologies !== undefined && { technologies: data.technologies }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return { success: true, experience: exp };
  } catch (error: any) {
    console.error('Error updating experience:', error);
    return { success: false, error: error.message || 'Failed to update experience.' };
  }
}

export async function deleteExperience(id: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    await prisma.experience.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return { success: false, error: error.message || 'Failed to delete experience.' };
  }
}
