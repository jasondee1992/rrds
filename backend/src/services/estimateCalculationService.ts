import { Prisma } from "@prisma/client";
import {
  airconCapacities,
  estimateServices,
  urgencyLevels,
} from "../config/estimatePricing";
import { AppError } from "../utils/AppError";

export type EstimateCalculationInput = {
  selectedService: string;
  airconCapacity: string;
  quantity: number;
  urgencyLevel: string;
  taxRate?: Prisma.Decimal;
};

function decimal(value: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

function money(value: Prisma.Decimal) {
  return value.toFixed(2);
}

export function calculateEstimate(input: EstimateCalculationInput) {
  const service = estimateServices.find((item) => item.label === input.selectedService);
  const capacity = airconCapacities.find((item) => item.label === input.airconCapacity);
  const urgency = urgencyLevels.find((item) => item.label === input.urgencyLevel);

  if (!service || !capacity || !urgency) {
    throw new AppError("Invalid estimate selection.", 400);
  }

  const baseServiceAmount = decimal(service.basePrice);
  const quantity = decimal(input.quantity);
  const capacityAdjustment = decimal(capacity.adjustment).mul(quantity);
  const urgencyAdjustment = decimal(urgency.adjustment);
  const estimatedAdditionalFees = decimal(service.additionalFees);
  const estimatedSubtotal = baseServiceAmount
    .mul(quantity)
    .plus(capacityAdjustment)
    .plus(urgencyAdjustment)
    .plus(estimatedAdditionalFees);
  const taxRate = input.taxRate ?? decimal(0);
  const estimatedTax = estimatedSubtotal.mul(taxRate).div(100);
  const estimatedTotal = estimatedSubtotal.plus(estimatedTax);

  return {
    baseServiceAmount,
    capacityAdjustment,
    urgencyAdjustment,
    estimatedAdditionalFees,
    estimatedSubtotal,
    estimatedTax,
    estimatedTotal,
    display: {
      baseServiceAmount: money(baseServiceAmount),
      capacityAdjustment: money(capacityAdjustment),
      urgencyAdjustment: money(urgencyAdjustment),
      estimatedAdditionalFees: money(estimatedAdditionalFees),
      estimatedSubtotal: money(estimatedSubtotal),
      estimatedTax: money(estimatedTax),
      estimatedTotal: money(estimatedTotal),
    },
  };
}
