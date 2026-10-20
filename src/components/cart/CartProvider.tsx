"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  cartTotals,
  emptyCart,
  lookupSku,
  makeCartReducer,
  maxQuantityFor,
  readStoredCart,
  resolveCart,
  writeStoredCart,
  type CartCatalogue,
  type CartTotals,
  type RemovedCartLine,
  type ResolvedCartLine,
} from "~/lib/cart";

type CartContextValue = {
  lines: ResolvedCartLine[];
  totals: CartTotals;
  /**
   * False until the stored cart has been read. The server cannot know what is
   * in localStorage, so the first paint always shows an empty cart; UI that
   * would otherwise flash "0" should wait on this.
   */
  hydrated: boolean;
  catalogue: CartCatalogue;
  addItem: (sku: string, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  maxFor: (sku: string) => number;
  /** Lines storage offered that could not be honoured, for an honest notice. */
  removed: RemovedCartLine[];
  dismissNotice: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** The SKU most recently added, so the drawer can highlight it. */
  lastAddedSku: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  catalogue,
  children,
}: {
  catalogue: CartCatalogue;
  children: ReactNode;
}) {
  const reducer = useMemo(() => makeCartReducer(catalogue), [catalogue]);
  const [state, dispatch] = useReducer(reducer, emptyCart);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedSku, setLastAddedSku] = useState<string | null>(null);

  // Read storage once, after mount. Doing this during render or in the initial
  // reducer state would produce server/client HTML that disagrees.
  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStoredCart() });
    setHydrated(true);
  }, []);

  // Persist on every change, but ONLY after the initial read — otherwise the
  // empty starting state would overwrite a real stored cart on first paint.
  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(state.lines);
  }, [state.lines, hydrated]);

  // The catalogue can change under a cart that is already loaded (a redeploy,
  // a router.refresh, and routinely once this is database-backed). Nothing
  // else re-clamps, so without this a line could sit at quantity 10 against
  // stock of 2 and bill the subtotal for ten units it cannot fulfil.
  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "reconcile" });
  }, [catalogue, hydrated]);

  // Keep other tabs in step. `storage` fires in every tab except the one that
  // wrote, so there is no echo to guard against.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
      dispatch({ type: "hydrate", lines: readStoredCart() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const closeCart = useCallback(() => setIsOpen(false), []);
  const openCart = useCallback(() => setIsOpen(true), []);

  // Opening the drawer on add is a side effect of the action, not of state, so
  // it lives here rather than in an effect watching the line count.
  const addItem = useCallback((sku: string, quantity = 1) => {
    dispatch({ type: "add", sku, quantity });
    setLastAddedSku(sku);
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    dispatch({ type: "setQuantity", sku, quantity });
  }, []);

  const removeItem = useCallback((sku: string) => {
    dispatch({ type: "remove", sku });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);

  const dismissNotice = useCallback(
    () => dispatch({ type: "dismissNotice" }),
    [],
  );

  const maxFor = useCallback(
    (sku: string) => maxQuantityFor(lookupSku(catalogue, sku)),
    [catalogue],
  );

  const lines = useMemo(
    () => resolveCart(state, catalogue),
    [state, catalogue],
  );
  const totals = useMemo(() => cartTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      hydrated,
      catalogue,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      maxFor,
      removed: state.removed,
      dismissNotice,
      isOpen,
      openCart,
      closeCart,
      lastAddedSku,
    }),
    [
      lines,
      totals,
      hydrated,
      catalogue,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      maxFor,
      state.removed,
      dismissNotice,
      isOpen,
      openCart,
      closeCart,
      lastAddedSku,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Quantity of a SKU currently in the cart, 0 when absent. */
export function useCartQuantity(sku: string): number {
  const { lines } = useCart();
  return lines.find((l) => l.sku === sku)?.quantity ?? 0;
}
