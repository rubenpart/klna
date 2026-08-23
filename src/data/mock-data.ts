/**
 * Couche UI — consomme les seed data et expose les mocks pour le dashboard.
 */
import {
  computeChannelProfitability,
  computeEventStats,
  computeKPIs,
  computeMonthlySales,
  computeTopEvents,
  getUrgentDeliveries as buildUrgentDeliveries,
  hydrateSeedData,
} from "./seed/hydrate";

const hydrated = hydrateSeedData();

export const mockEvents = hydrated.events;
export const mockSuppliers = hydrated.suppliers;
export const mockClients = hydrated.clients;
export const mockTickets = hydrated.tickets;
export const mockTransactions = hydrated.transactions;

export const mockEventStats = computeEventStats(mockEvents, mockTickets);
export const mockKPIs = computeKPIs(mockTickets, mockTransactions);
export const mockTopEvents = computeTopEvents(mockTickets, mockEvents);
export const mockMonthlySales = computeMonthlySales(mockTransactions, mockTickets);
export const mockChannelProfitability = computeChannelProfitability(
  mockTransactions,
  mockTickets
);

export function getUrgentDeliveries() {
  return buildUrgentDeliveries(mockTransactions, mockTickets, mockEvents);
}

export { SEED_DATABASE, SEED_IDS, getSeedStats } from "./seed";
