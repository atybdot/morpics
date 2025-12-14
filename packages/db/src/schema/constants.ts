import { tierEnum } from "./enums";
interface Item {
  allowed: number;
  unit: string | undefined;
  label: string;
}
interface Package {
  transformations: Item;
  storage: Item;
  cache: Item;
  seats: Item;
  bandwidth: Item;
}
interface Tier {
  slug: (typeof tierEnum.enumValues)[keyof typeof tierEnum.enumValues];
  price: number;
  discount: number;
  package: Package;
}

const FREE: Tier = {
  slug: "free",
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
  slug: "free",
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

export const PRICING_TABLE = { FREE, STARTER, PRO };
