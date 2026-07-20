'use server';

import { prisma } from '../lib/prisma';

export async function submitInquiry(data: {
  name: string;
  email: string;
  company?: string;
  budget: string;
  timeline: string;
  message: string;
}) {
  try {
    if (!data.name || !data.email || !data.budget || !data.timeline || !data.message) {
      return { success: false, error: 'Please fill all required fields.' };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company || null,
        budget: data.budget,
        timeline: data.timeline,
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

