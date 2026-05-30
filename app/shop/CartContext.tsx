"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "cleanova_cart_v1";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** stok produk saat ditambahkan, untuk batas qty */
  stock: number;
  /** berat per unit dalam gram (untuk hitung ongkir) */
  weight: number;
};

type CartCtx = {
  items: CartLine[];
  totalQty: number;
  totalAmount: number;
  totalWeight: number;
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isHydrated: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate dari localStorage di client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // abaikan parse error
    }
    setIsHydrated(true);
  }, []);

  // Persist setiap perubahan.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // abaikan kuota
    }
  }, [items, isHydrated]);

  const add: CartCtx["add"] = useCallback((line) => {
    setItems((prev) => {
      const qty = Math.max(1, line.quantity ?? 1);
      const idx = prev.findIndex((it) => it.productId === line.productId);
      if (idx === -1) {
        return [
          ...prev,
          {
            productId: line.productId,
            name: line.name,
            price: line.price,
            imageUrl: line.imageUrl,
            stock: line.stock,
            weight: line.weight,
            quantity: Math.min(qty, line.stock),
          },
        ];
      }
      const next = [...prev];
      const merged = next[idx].quantity + qty;
      next[idx] = {
        ...next[idx],
        quantity: Math.min(merged, line.stock),
        // refresh metadata supaya nama/gambar/harga tidak basi
        name: line.name,
        price: line.price,
        imageUrl: line.imageUrl,
        stock: line.stock,
        weight: line.weight,
      };
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId
            ? { ...it, quantity: Math.max(0, Math.min(qty, it.stock)) }
            : it
        )
        .filter((it) => it.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    let qty = 0;
    let amount = 0;
    let weight = 0;
    for (const it of items) {
      qty += it.quantity;
      amount += it.quantity * it.price;
      weight += it.quantity * (it.weight || 0);
    }
    return { qty, amount, weight };
  }, [items]);

  const value: CartCtx = {
    items,
    totalQty: totals.qty,
    totalAmount: totals.amount,
    totalWeight: totals.weight,
    add,
    setQty,
    remove,
    clear,
    isHydrated,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
