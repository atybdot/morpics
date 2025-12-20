import { env } from "process";
import { tierEnum } from "./enums";
import type { UsageMetricKey } from "./subscription";

export interface Item {
  allowed: number;
  unit: string | undefined;
  label: string;
}

// Package type is now tightly coupled to usage metrics
export type Package = {
  [K in UsageMetricKey]: Item;
};

export interface Tier {
  slug: (typeof tierEnum.enumValues)[keyof typeof tierEnum.enumValues];
  id: string;
  price: number;
  discount: number;
  package: Package;
}

const FREE: Tier = {
  slug: "free",
  id: "free",
  price: 0,
  discount: 0,
  package: {
    transformations: {
      allowed: 1,
      unit: "k",
      label: "transformations",
    },
    storage: {
      allowed: 0.5,
      unit: "gb",
      label: "storage",
    },
    cache: {
      allowed: 2,
      unit: "gb",
      label: "cache storage",
    },
    buckets: {
      allowed: 1,
      unit: "",
      label: "buckets",
    },
    seats: {
      allowed: 1,
      unit: undefined,
      label: "members",
    },
    bandwidth: {
      label: "bandwidth",
      allowed: 10,
      unit: "gb",
    },
  },
};

const STARTER: Tier = {
  slug: "starter",
  id: env.STARTER_ID,
  price: 10,
  discount: 20,
  package: {
    transformations: {
      allowed: 5,
      unit: "k",
      label: "transformations",
    },
    storage: {
      allowed: 3,
      unit: "gb",
      label: "storage",
    },
    cache: {
      allowed: 10,
      unit: "gb",
      label: "cache storage",
    },
    buckets: {
      allowed: 3,
      unit: "",
      label: "buckets",
    },
    seats: {
      allowed: 5,
      unit: undefined,
      label: "members",
    },
    bandwidth: {
      label: "bandwidth",
      allowed: 25,
      unit: "gb",
    },
  },
};

const PRO: Tier = {
  slug: "pro",
  price: 25,
  discount: 20,
  id: env.PRO_ID,
  package: {
    transformations: {
      allowed: 15,
      unit: "k",
      label: "transformations",
    },
    storage: {
      allowed: 10,
      unit: "gb",
      label: "storage",
    },
    cache: {
      allowed: 30,
      unit: "gb",
      label: "cache storage",
    },
    buckets: {
      allowed: 10,
      unit: "",
      label: "buckets",
    },
    seats: {
      allowed: 20,
      unit: undefined,
      label: "members",
    },
    bandwidth: {
      label: "bandwidth",
      allowed: 100,
      unit: "gb",
    },
  },
};

export const PRICING_TABLE = { free: FREE, starter: STARTER, pro: PRO };
export type UserTier = keyof typeof PRICING_TABLE;
export const userTier = tierEnum.enumValues;
