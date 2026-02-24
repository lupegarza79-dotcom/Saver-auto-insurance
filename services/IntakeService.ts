import { supabase } from '@/lib/supabase';

export type ContactPreference = 'whatsapp' | 'text' | 'call';

export interface QuoteFormPayload {
  phone: string;
  fullName: string;
  zip: string;
  drivers: { name: string; dob: string }[];
  vehiclesCount: number;
  vins: string[];
  coverage: 'minimum' | 'full';
  currentlyInsured: boolean | null;
  insuredMonths: string | null;
  homeowner: boolean | null;
  contactPreference: ContactPreference;
  language: 'en' | 'es';
  consentGiven: boolean;
}

export interface UploadIntakePayload {
  insuredFullName?: string;
  phone?: string;
  zip?: string;
  contactPreference: ContactPreference;
  language: 'en' | 'es';
  consentGiven: boolean;
  drivers: {
    fullName?: string;
    dob?: string;
    idLast4?: string;
  }[];
  vehicles: {
    vin?: string;
    year?: number;
    make?: string;
    model?: string;
  }[];
  coverageType?: 'minimum' | 'full';
  liabilityLimits?: string;
  collisionDeductible?: number;
  compDeductible?: number;
  currentCarrier?: string;
  currentPremium?: number;
  policyExpiryDate?: string;
  currentPolicyDoc?: string;
}

export interface ReferralPayload {
  referrerPhone?: string;
  referredName: string;
  referredPhone: string;
  language: 'en' | 'es';
  source: 'app_referral';
}

export interface SubmitResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

function mapQuoteFormToBackend(payload: QuoteFormPayload): Record<string, unknown> {
  return {
    phone: payload.phone.replace(/\D/g, ''),
    full_name: payload.fullName.trim(),
    zip: payload.zip.replace(/\D/g, ''),
    vehicles: payload.vins.map((v) => ({ vin: v.trim() })),
    drivers: payload.drivers.map((d) => ({
      name: d.name.trim(),
      dob: d.dob,
    })),
    coverage_type: payload.coverage === 'minimum' ? 'liability' : 'full',
    currently_insured: payload.currentlyInsured,
    insured_months: payload.insuredMonths,
    homeowner: payload.homeowner,
    contact_preference: payload.contactPreference,
    language: payload.language,
    consent: payload.consentGiven,
    source: 'quote-form',
    status: 'new',
    created_at: new Date().toISOString(),
  };
}

function mapUploadIntakeToBackend(payload: UploadIntakePayload): Record<string, unknown> {
  return {
    phone: payload.phone?.replace(/\D/g, ''),
    full_name: payload.insuredFullName?.trim(),
    zip: payload.zip?.replace(/\D/g, ''),
    vehicles: payload.vehicles
      .filter((v) => v.vin || v.make)
      .map((v) => ({
        vin: v.vin,
        year: v.year,
        make: v.make,
        model: v.model,
      })),
    drivers: payload.drivers
      .filter((d) => d.fullName)
      .map((d) => ({
        name: d.fullName,
        dob: d.dob,
        id_last4: d.idLast4,
      })),
    coverage_type: payload.coverageType === 'minimum' ? 'liability' : payload.coverageType === 'full' ? 'full' : null,
    liability_limits: payload.liabilityLimits,
    collision_deductible: payload.collisionDeductible,
    comp_deductible: payload.compDeductible,
    current_carrier: payload.currentCarrier,
    current_premium: payload.currentPremium,
    policy_expiry_date: payload.policyExpiryDate,
    current_policy_doc: payload.currentPolicyDoc,
    contact_preference: payload.contactPreference,
    language: payload.language,
    consent: payload.consentGiven,
    source: 'upload',
    status: 'new',
    created_at: new Date().toISOString(),
  };
}

function mapReferralToBackend(payload: ReferralPayload): Record<string, unknown> {
  return {
    referrer_phone: payload.referrerPhone?.replace(/\D/g, ''),
    referred_name: payload.referredName.trim(),
    referred_phone: payload.referredPhone.replace(/\D/g, ''),
    language: payload.language,
    source: payload.source,
    status: 'new',
    created_at: new Date().toISOString(),
  };
}

export async function submitQuoteForm(payload: QuoteFormPayload): Promise<SubmitResult> {
  const backendPayload = mapQuoteFormToBackend(payload);
  console.log('[IntakeService] submitQuoteForm payload:', backendPayload);

  try {
    const { error } = await supabase.from('leads').insert(backendPayload);
    if (error) {
      console.error('[IntakeService] submitQuoteForm error:', error);
      return { success: false, error: error.message };
    }
    console.log('[IntakeService] Quote form submitted successfully');
    return { success: true };
  } catch (err: any) {
    console.error('[IntakeService] submitQuoteForm exception:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function submitUploadIntake(payload: UploadIntakePayload): Promise<SubmitResult> {
  const backendPayload = mapUploadIntakeToBackend(payload);
  console.log('[IntakeService] submitUploadIntake payload:', backendPayload);

  try {
    const { error } = await supabase.from('leads').insert(backendPayload);
    if (error) {
      console.error('[IntakeService] submitUploadIntake error:', error);
      return { success: false, error: error.message };
    }
    console.log('[IntakeService] Upload intake submitted successfully');
    return { success: true };
  } catch (err: any) {
    console.error('[IntakeService] submitUploadIntake exception:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function submitReferral(payload: ReferralPayload): Promise<SubmitResult> {
  const backendPayload = mapReferralToBackend(payload);
  console.log('[IntakeService] submitReferral payload:', backendPayload);

  try {
    const { error } = await supabase.from('referrals').insert(backendPayload);
    if (error) {
      console.error('[IntakeService] submitReferral error:', error);
      return { success: false, error: error.message };
    }
    console.log('[IntakeService] Referral submitted successfully');
    return { success: true };
  } catch (err: any) {
    console.error('[IntakeService] submitReferral exception:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export const IntakeService = {
  submitQuoteForm,
  submitUploadIntake,
  submitReferral,
  _mapQuoteFormToBackend: mapQuoteFormToBackend,
  _mapUploadIntakeToBackend: mapUploadIntakeToBackend,
  _mapReferralToBackend: mapReferralToBackend,
};

export default IntakeService;
