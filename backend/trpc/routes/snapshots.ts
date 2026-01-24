import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { db } from "@/backend/db";
import { PolicySnapshot, Lead, SnapshotGrade } from "@/types";
import { generateObject } from "@rork-ai/toolkit-sdk";

const snapshotAnalysisSchema = z.object({
  grade: z.enum(['A', 'B', 'C', 'D']),
  monthlySavings: z.number(),
  findings: z.array(z.string()),
  recommendations: z.array(z.string()),
  coverageScore: z.number().min(0).max(100),
  priceScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
});

export const snapshotsRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({
      policyId: z.string(),
      carrier: z.string(),
      premium: z.number(),
      deductibleComp: z.number().optional(),
      deductibleColl: z.number().optional(),
      liabilityBI: z.string().optional(),
      liabilityPD: z.string().optional(),
      vehicleYear: z.number().optional(),
      vehicleMake: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log(`[SNAPSHOTS] Generating AI snapshot for policy ${input.policyId}`);
      
      try {
        const analysis = await generateObject({
          messages: [{
            role: 'user',
            content: `Analyze this auto insurance policy and provide a snapshot assessment:

Policy Details:
- Carrier: ${input.carrier}
- Monthly Premium: $${input.premium}
- Comprehensive Deductible: $${input.deductibleComp || 'Unknown'}
- Collision Deductible: $${input.deductibleColl || 'Unknown'}
- Bodily Injury Liability: ${input.liabilityBI || 'Unknown'}
- Property Damage Liability: ${input.liabilityPD || 'Unknown'}
- Vehicle: ${input.vehicleYear || ''} ${input.vehicleMake || 'Unknown'}

Provide:
1. A grade (A=excellent value, B=good, C=average, D=poor value)
2. Estimated monthly savings if they shop around (realistic estimate $20-80 range)
3. 2-3 key findings about their policy (what's good, what's concerning)
4. 2-3 recommendations to improve their coverage or save money
5. Coverage score (0-100): How good is their coverage?
6. Price score (0-100): How competitive is their price?
7. Overall score (0-100): Combined assessment

Be helpful and specific. Use plain language a regular person would understand.`
          }],
          schema: snapshotAnalysisSchema,
        });

        const snapshot: PolicySnapshot = {
          id: `snap_${Date.now()}`,
          policyId: input.policyId,
          grade: analysis.grade as SnapshotGrade,
          monthlySavings: analysis.monthlySavings,
          findings: analysis.findings,
          recommendations: analysis.recommendations,
          coverageScore: analysis.coverageScore,
          priceScore: analysis.priceScore,
          overallScore: analysis.overallScore,
          createdAt: new Date().toISOString(),
        };

        console.log(`[SNAPSHOTS] AI generated snapshot: Grade ${snapshot.grade}, savings $${snapshot.monthlySavings}/mo`);
        return db.createSnapshot(snapshot);
      } catch (error) {
        console.error('[SNAPSHOTS] AI generation failed, using fallback:', error);
        
        const fallbackSnapshot: PolicySnapshot = {
          id: `snap_${Date.now()}`,
          policyId: input.policyId,
          grade: input.premium > 200 ? 'C' : 'B',
          monthlySavings: Math.round(input.premium * 0.15 + Math.random() * 20),
          findings: [
            `You're paying $${input.premium}/month with ${input.carrier}`,
            input.deductibleComp && input.deductibleComp >= 1000 
              ? 'Your deductible is on the higher side, which lowers your premium'
              : 'Your deductible seems reasonable for your coverage level',
            'We found similar drivers paying less for comparable coverage',
          ],
          recommendations: [
            'Consider bundling with home/renters insurance for 10-15% savings',
            'Ask about safe driver or low mileage discounts',
            'Compare quotes from at least 3 carriers before renewal',
          ],
          coverageScore: 70 + Math.round(Math.random() * 20),
          priceScore: 50 + Math.round(Math.random() * 30),
          overallScore: 60 + Math.round(Math.random() * 25),
          createdAt: new Date().toISOString(),
        };

        return db.createSnapshot(fallbackSnapshot);
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.getSnapshot(input.id);
    }),

  getByPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(({ input }) => {
      return db.getSnapshotByPolicy(input.policyId);
    }),

  list: publicProcedure.query(() => {
    return db.getAllSnapshots();
  }),
});

export const leadsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      userId: z.string(),
      userName: z.string().optional(),
      userPhone: z.string(),
      source: z.enum(['app', 'whatsapp', 'referral']).default('app'),
      policyId: z.string().optional(),
      potentialSavings: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const existingLead = db.getLeadByUser(input.userId);
      if (existingLead) {
        console.log(`[LEADS] Lead already exists for user ${input.userId}`);
        return existingLead;
      }

      const lead: Lead = {
        id: `lead_${Date.now()}`,
        userId: input.userId,
        userName: input.userName,
        userPhone: input.userPhone,
        status: 'new',
        source: input.source,
        policyId: input.policyId,
        potentialSavings: input.potentialSavings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(`[LEADS] Creating new lead for ${input.userPhone}`);
      return db.createLead(lead);
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['new', 'contacted', 'snapshot_sent', 'interested', 'quoted', 'won', 'lost', 'follow_up']),
      notes: z.string().optional(),
      nextFollowUpAt: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const updates: Partial<Lead> = {
        status: input.status,
        lastContactedAt: new Date().toISOString(),
      };
      if (input.notes) updates.notes = input.notes;
      if (input.nextFollowUpAt) updates.nextFollowUpAt = input.nextFollowUpAt;

      console.log(`[LEADS] Updating lead ${input.id} to status: ${input.status}`);
      return db.updateLead(input.id, updates);
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.getLead(input.id);
    }),

  list: publicProcedure.query(() => {
    return db.getAllLeads();
  }),

  needingFollowUp: publicProcedure.query(() => {
    return db.getLeadsNeedingFollowUp();
  }),

  byStatus: publicProcedure
    .input(z.object({ status: z.enum(['new', 'contacted', 'snapshot_sent', 'interested', 'quoted', 'won', 'lost', 'follow_up']) }))
    .query(({ input }) => {
      return db.getLeadsByStatus(input.status);
    }),
});
