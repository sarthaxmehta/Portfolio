'use server';

import { prisma } from '../lib/prisma';
import { isAuthorizedAdmin } from '../lib/auth';

const SEED_SKILLS = [
  // Programming
  { name: 'TypeScript', category: 'Programming', proficiency: 92, featured: true, order: 1 },
  { name: 'Python', category: 'Programming', proficiency: 95, featured: true, order: 2 },
  { name: 'C++', category: 'Programming', proficiency: 88, featured: true, order: 3 },
  { name: 'JavaScript', category: 'Programming', proficiency: 90, featured: false, order: 4 },
  { name: 'C', category: 'Programming', proficiency: 82, featured: false, order: 5 },

  // Frameworks & Web
  { name: 'Next.js', category: 'Frameworks', proficiency: 94, featured: true, order: 1 },
  { name: 'React', category: 'Frameworks', proficiency: 93, featured: true, order: 2 },
  { name: 'FastAPI', category: 'Frameworks', proficiency: 90, featured: true, order: 3 },
  { name: 'Electron', category: 'Frameworks', proficiency: 85, featured: false, order: 4 },

  // AI / ML
  { name: 'PyTorch', category: 'AI/ML', proficiency: 91, featured: true, order: 1 },
  { name: 'TensorFlow', category: 'AI/ML', proficiency: 84, featured: false, order: 2 },
  { name: 'Google Earth Engine', category: 'AI/ML', proficiency: 89, featured: true, order: 3 },
  { name: 'Hugging Face', category: 'AI/ML', proficiency: 86, featured: false, order: 4 },

  // Databases & Backend
  { name: 'Prisma', category: 'Databases', proficiency: 92, featured: true, order: 1 },
  { name: 'SQLite', category: 'Databases', proficiency: 90, featured: true, order: 2 },
  { name: 'MySQL', category: 'Databases', proficiency: 85, featured: false, order: 3 },
  { name: 'MongoDB', category: 'Databases', proficiency: 82, featured: false, order: 4 },

  // Tools & GIS
  { name: 'QGIS', category: 'Tools', proficiency: 88, featured: true, order: 1 },
  { name: 'Git & GitHub', category: 'Tools', proficiency: 95, featured: true, order: 2 },
  { name: 'Vercel', category: 'Tools', proficiency: 90, featured: false, order: 3 },
];

export async function getSkills() {
  try {
    let skills = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    if (skills.length === 0) {
      console.log('Seeding initial skills...');
      await prisma.skill.createMany({
        data: SEED_SKILLS,
      });
      skills = await prisma.skill.findMany({
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });
    }

    return { success: true, skills };
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    return { success: false, error: error.message || 'Failed to fetch skills.' };
  }
}

export async function createSkill(data: {
  name: string;
  category: string;
  proficiency?: number;
  featured?: boolean;
  order?: number;
}) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    if (!data.name || !data.category) {
      return { success: false, error: 'Please provide Skill Name and Category.' };
    }

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        proficiency: data.proficiency ?? 85,
        featured: data.featured ?? true,
        order: data.order ?? 0,
      },
    });

    return { success: true, skill };
  } catch (error: any) {
    console.error('Error creating skill:', error);
    return { success: false, error: error.message || 'Failed to create skill.' };
  }
}

export async function updateSkill(
  id: string,
  data: {
    name?: string;
    category?: string;
    proficiency?: number;
    featured?: boolean;
    order?: number;
  }
) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return { success: true, skill };
  } catch (error: any) {
    console.error('Error updating skill:', error);
    return { success: false, error: error.message || 'Failed to update skill.' };
  }
}

export async function deleteSkill(id: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    await prisma.skill.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    return { success: false, error: error.message || 'Failed to delete skill.' };
  }
}
