import algosdk, { encodeAddress } from 'algosdk';

type FormatItem =
  | { readonly type: 'uint' }
  | { readonly type: 'address' }
  | { readonly type: 'bytes'; readonly size: number }
  | { readonly type: 'string'; readonly size: number };

type Format = {
  readonly [key: string]: FormatItem;
};

const format = {
  priceCoin_locked: {
    type: 'uint',
  },
  priceCoin_available: {
    type: 'uint',
  },
  baseCoin_locked: {
    type: 'uint',
  },
  baseCoin_available: {
    type: 'uint',
  },
  companyId: {
    type: 'uint',
  },
  WLFeeShare: {
    type: 'uint',
  },
  WLCustomFee: {
    type: 'uint',
  },
  slotMap: {
    type: 'uint',
  },
} as const satisfies Format;

export const unpackData = (data: Uint8Array) => {
  const result = new Map<string, any>();
  let index = 0;
  for (const [name, type] of Object.entries(format) as Array<[string, Format[keyof Format]]>) {
    if (index >= data.length) {
      throw new Error('Array index out of bounds');
    }

    let value: any;
    switch (type.type) {
      case 'address':
        value = encodeAddress(data.slice(index, index + 32));
        index += 32;
        break;
      case 'bytes':
        value = data.slice(index, index + type.size);
        value = algosdk.decodeUint64(value, 'mixed');
        index += type.size;
        break;
      case 'uint':
        value = algosdk.decodeUint64(data.slice(index, index + 8), 'mixed');
        index += 8;
        break;
      case 'string':
        value = decodeString(data.slice(index, index + type.size));
        index += type.size;
        break;
    }
    result.set(name, value);
  }

  return Object.fromEntries(result);
};

export const decodeString = (value: Uint8Array): string => {
  return Buffer.from(value).toString('utf-8');
};
