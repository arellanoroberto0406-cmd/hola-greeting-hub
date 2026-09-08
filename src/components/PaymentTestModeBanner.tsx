const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full rounded-lg bg-red-100 border border-red-300 px-4 py-2 text-center text-sm text-red-800">
        El cobro con tarjeta todavía no está listo para cobros reales.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full rounded-lg bg-orange-100 border border-orange-300 px-4 py-2 text-center text-sm text-orange-800">
        Estás en modo de prueba: usa la tarjeta 4242 4242 4242 4242 para probar sin dinero real.
      </div>
    );
  }
  return null;
}
