# UI Payloads per Step / Flow

This document describes the payload shapes the frontend produces at each step and on final submit. The service adapter layer (`services/IntakeService.ts`) is the single place where UI payloads are mapped to backend payloads. **No screen should insert directly into Supabase or call backend tables.**

---

## 1. Quote Form Flow (`/quote-form`)

### Steps & Fields Collected

| Step | Field(s) | Type | Required |
|------|----------|------|----------|
| `phone` | `phone` | `string` (10 digits) | Yes |
| `name` | `fullName` | `string` | Yes |
| `zip` | `zip` | `string` (5 digits) | Yes |
| `driversCount` | `driversCount` | `number` (1-4) | Yes |
| `driverInfo` | `drivers[].name`, `drivers[].dob` | `string`, `MM/DD/YYYY` | Yes |
| `vehiclesCount` | `vehiclesCount` | `number` (1-4) | Yes |
| `vin` | `vins[]` | `string` (17 chars) | Yes |
| `coverage` | `coverage` | `'minimum' \| 'full'` | Yes |
| `discounts` | `currentlyInsured`, `insuredMonths`, `homeowner` | `boolean \| null`, `string \| null`, `boolean \| null` | Optional |
| `contactPref` | `contactPreference` | `'whatsapp' \| 'text' \| 'call'` | Yes |
| `consent` | `consentGiven` | `boolean` | Yes (must be true) |

### Final Submit Payload (`QuoteFormPayload`)

```typescript
{
  phone: string;           // raw 10-digit
  fullName: string;
  zip: string;             // 5-digit
  drivers: { name: string; dob: string }[];
  vehiclesCount: number;
  vins: string[];          // 17-char VINs
  coverage: 'minimum' | 'full';
  currentlyInsured: boolean | null;
  insuredMonths: string | null;    // '3' | '6' | '12+' | null
  homeowner: boolean | null;
  contactPreference: 'whatsapp' | 'text' | 'call';
  language: 'en' | 'es';
  consentGiven: boolean;
}
```

### Backend Mapping (via `IntakeService.submitQuoteForm`)

| UI Field | Backend Column |
|----------|----------------|
| `phone` | `phone` (digits only) |
| `fullName` | `full_name` |
| `zip` | `zip` |
| `drivers` | `drivers` (JSON array) |
| `vins` | `vehicles` (JSON array of `{vin}`) |
| `coverage` | `coverage_type` (`'liability'` or `'full'`) |
| `currentlyInsured` | `currently_insured` |
| `insuredMonths` | `insured_months` |
| `homeowner` | `homeowner` |
| `contactPreference` | `contact_preference` |
| `language` | `language` |
| `consentGiven` | `consent` |
| (auto) | `source: 'quote-form'` |
| (auto) | `status: 'new'` |
| (auto) | `created_at` |

---

## 2. Upload Policy Flow (`/upload-document`)

### Fields Collected (from AI scan + user context)

```typescript
{
  insuredFullName?: string;
  phone?: string;
  zip?: string;
  contactPreference: 'whatsapp' | 'text' | 'call';
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
  liabilityLimits?: string;        // e.g. "30000/60000"
  collisionDeductible?: number;
  compDeductible?: number;
  currentCarrier?: string;
  currentPremium?: number;
  policyExpiryDate?: string;
  currentPolicyDoc?: string;        // 'uploaded' if dec page present
}
```

### Backend Mapping (via `IntakeService.submitUploadIntake`)

| UI Field | Backend Column |
|----------|----------------|
| `insuredFullName` | `full_name` |
| `phone` | `phone` |
| `zip` | `zip` |
| `drivers` | `drivers` (JSON) |
| `vehicles` | `vehicles` (JSON) |
| `coverageType` | `coverage_type` |
| `liabilityLimits` | `liability_limits` |
| `collisionDeductible` | `collision_deductible` |
| `compDeductible` | `comp_deductible` |
| `currentCarrier` | `current_carrier` |
| `currentPremium` | `current_premium` |
| `policyExpiryDate` | `policy_expiry_date` |
| `currentPolicyDoc` | `current_policy_doc` |
| `contactPreference` | `contact_preference` |
| `language` | `language` |
| `consentGiven` | `consent` |
| (auto) | `source: 'upload'` |
| (auto) | `status: 'new'` |

---

## 3. Referral Flow (`/referral`)

### Payload (`ReferralPayload`)

```typescript
{
  referrerPhone?: string;   // current user's phone
  referredName: string;
  referredPhone: string;    // 10-digit
  language: 'en' | 'es';
  source: 'app_referral';
}
```

### Backend Mapping (via `IntakeService.submitReferral`)

| UI Field | Backend Column |
|----------|----------------|
| `referrerPhone` | `referrer_phone` |
| `referredName` | `referred_name` |
| `referredPhone` | `referred_phone` |
| `language` | `language` |
| `source` | `source` |
| (auto) | `status: 'new'` |
| (auto) | `created_at` |

---

## Service Adapter Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Quote Form  │────▶│                      │────▶│             │
│              │     │  IntakeService.ts     │     │  Supabase   │
│  Upload Doc  │────▶│  (payload mapping)   │────▶│  (backend)  │
│              │     │                      │     │             │
│  Referral    │────▶│  Single adapter layer │────▶│             │
└─────────────┘     └──────────────────────┘     └─────────────┘
```

All payload-to-backend mapping happens in `services/IntakeService.ts`. UI screens produce typed payloads, the adapter maps them to backend column names. If the backend contract changes, only the adapter needs updating.

---

## Texas Coverage: 30/60/25

The coverage explainer modal uses the correct Texas minimum liability:
- **$30,000** bodily injury per person
- **$60,000** bodily injury per accident
- **$25,000** property damage

This is displayed in friendly language in both EN and ES in the quote form coverage step.
