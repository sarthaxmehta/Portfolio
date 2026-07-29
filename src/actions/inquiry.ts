'use server';

import { prisma } from '../lib/prisma';
import { isAuthorizedAdmin } from '../lib/auth';

export async function submitInquiry(data: {
  name: string;
  email: string;
  company?: string;
  budget: string;
  timeline: string;
  message: string;
}) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, error: 'Please fill all required fields.' };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company || null,
        budget: data.budget || 'General Inquiry',
        timeline: data.timeline || 'Immediate',
        message: data.message,
      },
    });

    return { success: true, inquiryId: inquiry.id };
  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    return { success: false, error: error.message || 'An error occurred while saving your inquiry.' };
  }
}

export async function getInquiries() {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized access.' };
  }

  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, inquiries };
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return { success: false, error: error.message || 'Failed to fetch inquiries.' };
  }
}

export async function deleteInquiry(id: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    await prisma.inquiry.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting inquiry:', error);
    return { success: false, error: error.message || 'Failed to delete inquiry.' };
  }
}

export async function updateInquiryStatus(id: string, status: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    return { success: true, inquiry };
  } catch (error: any) {
    console.error('Error updating inquiry status:', error);
    return { success: false, error: error.message || 'Failed to update status.' };
  }
}

export async function addInquiryNote(id: string, notes: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized action.' };
  }

  try {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { notes },
    });
    return { success: true, inquiry };
  } catch (error: any) {
    console.error('Error updating inquiry notes:', error);
    return { success: false, error: error.message || 'Failed to update notes.' };
  }
}
